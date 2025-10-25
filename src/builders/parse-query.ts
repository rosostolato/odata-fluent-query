import { QueryDescriptor } from '../models'
import { createQueryDescriptor } from './create-query'

/**
 * Parses an OData query string into a QueryDescriptor
 * @param queryString The OData query string (e.g., "$filter=id eq 1&$select=name")
 * @returns A QueryDescriptor object
 */
export function parseODataQuery(queryString: string): QueryDescriptor {
  if (!queryString || queryString.trim() === '') {
    return createQueryDescriptor()
  }

  const descriptor = createQueryDescriptor()

  const cleanQueryString = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString

  const params = cleanQueryString.split('&')

  for (const param of params) {
    const [key, ...valueParts] = param.split('=')
    if (!key || valueParts.length === 0) continue

    const value = valueParts.join('=') 
    const trimmedValue = decodeURIComponent(value).trim()
    if (!trimmedValue) continue 

    switch (key) {
      case '$filter':
        descriptor.filters.push(trimmedValue)
        break

      case '$select':
        descriptor.select = trimmedValue
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        break

      case '$orderby':
        descriptor.orderby = trimmedValue
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        break

      case '$skip': {
        const skipValue = parseInt(trimmedValue, 10)
        if (!isNaN(skipValue)) {
          descriptor.skip = skipValue
        }
        break
      }

      case '$top': {
        const topValue = parseInt(trimmedValue, 10)
        if (!isNaN(topValue)) {
          descriptor.take = topValue
        }
        break
      }

      case '$count':
        descriptor.count = trimmedValue.toLowerCase() === 'true'
        break

      case '$compute':
        descriptor.compute = trimmedValue
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        break
        
      case '$search':
        descriptor.search = trimmedValue
        break

      case '$expand':
        descriptor.expands = parseExpand(trimmedValue)
        break

      case '$apply':
        parseApply(trimmedValue, descriptor)
        break

    }
  }

  return descriptor
}

/**
 * Parses the $expand parameter which can contain nested queries
 * @param expandValue The expand value string
 * @returns Array of QueryDescriptor objects for expands
 */
function parseExpand(expandValue: string): QueryDescriptor[] {
  const expands: QueryDescriptor[] = []

  // Split by comma, but handle nested parentheses
  const expandParts = splitExpandParts(expandValue)

  for (const part of expandParts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const openParenIndex = trimmed.indexOf('(')

    if (openParenIndex === -1) {
      expands.push(createQueryDescriptor(trimmed))
    } else {
      const key = trimmed.substring(0, openParenIndex).trim()
      const nestedQuery = trimmed.substring(
        openParenIndex + 1,
        trimmed.lastIndexOf(')')
      )

      const nestedDescriptor = parseNestedQuery(nestedQuery)
      nestedDescriptor.key = key

      expands.push(nestedDescriptor)
    }
  }

  return expands
}

/**
 * Splits expand parts by comma while respecting nested parentheses
 * @param expandValue The expand value string
 * @returns Array of expand parts
 */
function splitExpandParts(expandValue: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0

  for (let i = 0; i < expandValue.length; i++) {
    const char = expandValue[i]

    if (char === '(') {
      depth++
    } else if (char === ')') {
      depth--
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    parts.push(current.trim())
  }

  return parts
}

/**
 * Parses nested query parameters within expand
 * @param nestedQuery The nested query string (e.g., "$select=id,name;$filter=id gt 1")
 * @returns A QueryDescriptor for the nested query
 */
function parseNestedQuery(nestedQuery: string): QueryDescriptor {
  const descriptor = createQueryDescriptor()

  if (!nestedQuery.trim()) {
    return descriptor
  }

  const params = splitNestedParams(nestedQuery)

  for (const param of params) {
    const [key, ...valueParts] = param.split('=')
    if (!key || valueParts.length === 0) continue

    const value = valueParts.join('=')
    const trimmedKey = key.trim()
    const trimmedValue = value.trim()
    if (!trimmedValue) continue

    switch (trimmedKey) {
      case '$filter':
        descriptor.filters.push(trimmedValue)
        break

      case '$select':
        descriptor.select = trimmedValue
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        break

      case '$orderby':
        descriptor.orderby = trimmedValue
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        break

      case '$skip': {
        const skipValue = parseInt(trimmedValue, 10)
        if (!isNaN(skipValue)) {
          descriptor.skip = skipValue
        }
        break
      }

      case '$top': {
        const topValue = parseInt(trimmedValue, 10)
        if (!isNaN(topValue)) {
          descriptor.take = topValue
        }
        break
      }

      case '$count':
        descriptor.count = trimmedValue.toLowerCase() === 'true'
        break

      case '$compute':
        descriptor.compute = trimmedValue
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        break

      case '$expand':
        descriptor.expands = parseExpand(trimmedValue)
        break

      case '$search':
        descriptor.search = trimmedValue
        break
    }
  }

  return descriptor
}

/**
 * Splits nested parameters by semicolon while respecting nested parentheses
 * @param nestedQuery The nested query string
 * @returns Array of parameter strings
 */
function splitNestedParams(nestedQuery: string): string[] {
  const params: string[] = []
  let current = ''
  let depth = 0

  for (let i = 0; i < nestedQuery.length; i++) {
    const char = nestedQuery[i]

    if (char === '(') {
      depth++
    } else if (char === ')') {
      depth--
    } else if (char === ';' && depth === 0) {
      params.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    params.push(current.trim())
  }

  return params
}

/**
 * Parses the $apply parameter for groupby operations
 * @param applyValue The apply value string
 * @param descriptor The descriptor to modify
 */
function parseApply(applyValue: string, descriptor: QueryDescriptor): void {
  const groupbyMatch = applyValue.match(
    /groupby\(\(([^)]+)\)(?:,\s*aggregate\(([^)]+)\))?\)/
  )

  if (groupbyMatch && groupbyMatch[1]) {
    const fields = groupbyMatch[1].split(',').map(f => f.trim())
    descriptor.groupby = fields

    if (groupbyMatch[2]) {
      descriptor.aggregator = groupbyMatch[2].trim()
    }
  }
}

export interface ComputeExpression {
  toString(): string
  as(alias: string): ComputeExpression
}

export interface ComputeNumber extends ComputeExpression {
  multiply(value: number | ComputeNumber): ComputeNumber
  divide(value: number | ComputeNumber): ComputeNumber
  add(value: number | ComputeNumber): ComputeNumber
  subtract(value: number | ComputeNumber): ComputeNumber
}

export interface ComputeString extends ComputeExpression {
  substring(start: number, length?: number): ComputeString
  length(): ComputeNumber
  concat(...values: (string | ComputeString | ComputeExpression)[]): ComputeString
}

export interface ComputeBoolean extends ComputeExpression {
  and(value: boolean | ComputeBoolean): ComputeBoolean
  or(value: boolean | ComputeBoolean): ComputeBoolean
  not(): ComputeBoolean
  equals(value: boolean | ComputeBoolean): ComputeBoolean
  notEquals(value: boolean | ComputeBoolean): ComputeBoolean
}

export interface ComputeDate extends ComputeExpression {
  add(duration: string | ComputeDate): ComputeDate
  subtract(duration: string | ComputeDate): ComputeDate
  year(): ComputeNumber
  month(): ComputeNumber
  day(): ComputeNumber
  hour(): ComputeNumber
  minute(): ComputeNumber
  second(): ComputeNumber
  date(): ComputeDate
  time(): ComputeDate
}

export type ComputeBuilderType<T> = T extends string
  ? ComputeString
  : T extends number
  ? ComputeNumber
  : T extends boolean
  ? ComputeBoolean
  : T extends Date
  ? ComputeDate
  : T extends (infer U)[]
  ? ComputeBuilder<U>
  : T extends object
  ? ComputeBuilder<T>
  : ComputeExpression

export type ComputeBuilder<T> = {
  [P in keyof T]: ComputeBuilderType<T[P]>
}


export function createComputeProperty<T>(propertyPath: string): ComputeBuilderType<T> {
  return computePropertyBuilder(propertyPath) as ComputeBuilderType<T>
}

function computePropertyBuilder(propertyPath: string): unknown {
  const methods = {
    as: (alias: string) => ({ toString: () => `${propertyPath} as ${alias}` }),
    toString: () => propertyPath,
    
    substring: (start: number, length?: number) => {
      const args = length !== undefined ? `${start},${length}` : start.toString()
      return computePropertyBuilder(`substring(${propertyPath},${args})`)
    },
    length: () => computePropertyBuilder(`length(${propertyPath})`),
    concat: (...values: (string | ComputeString | ComputeExpression)[]) => {
      const args = values.map(v => {
        if (typeof v === 'string') {
          return `'${v}'`
        } else if (v && typeof v.toString === 'function') {
          return v.toString()
        } else {
          return v
        }
      })
      return computePropertyBuilder(`concat(${propertyPath},${args.join(',')})`)
    },
    
    multiply: (value: number | ComputeNumber | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} mul ${value.toString()}`)
    },
    divide: (value: number | ComputeNumber | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} div ${value.toString()}`)
    },
    add: (value: number | ComputeNumber | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} add ${value.toString()}`)
    },
    subtract: (value: number | ComputeNumber | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} sub ${value.toString()}`)
    },
    
    and: (value: boolean | ComputeBoolean | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} and ${value.toString()}`)
    },
    or: (value: boolean | ComputeBoolean | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} or ${value.toString()}`)
    },
    not: () => computePropertyBuilder(`not ${propertyPath}`),
    equals: (value: boolean | number | string | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} eq ${value.toString()}`)
    },
    notEquals: (value: boolean | number | string | ComputeExpression) => {
      return computePropertyBuilder(`${propertyPath} ne ${value.toString()}`)
    },
    
    year: () => computePropertyBuilder(`year(${propertyPath})`),
    month: () => computePropertyBuilder(`month(${propertyPath})`),
    day: () => computePropertyBuilder(`day(${propertyPath})`),
    hour: () => computePropertyBuilder(`hour(${propertyPath})`),
    minute: () => computePropertyBuilder(`minute(${propertyPath})`),
    second: () => computePropertyBuilder(`second(${propertyPath})`),
    date: () => computePropertyBuilder(`date(${propertyPath})`),
    time: () => computePropertyBuilder(`time(${propertyPath})`),
  }

  return new Proxy(methods, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'symbol') {
        return undefined
      }
      
      if (target[prop as keyof typeof target]) {
        return Reflect.get(target, prop)
      }
      
      const newPath = propertyPath ? `${propertyPath}/${prop}` : prop

      return computePropertyBuilder(newPath)
    }
  })
}


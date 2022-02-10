"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRelationQuery = exports.makeQueryParentheses = exports.makeQuery = void 0;
function makeQuery(qd) {
    var params = [];
    if (qd.filters.length) {
        if (qd.filters.length > 1) {
            params.push({
                key: '$filter',
                value: "".concat(qd.filters.map(makeQueryParentheses).join(' and ')),
            });
        }
        else {
            params.push({
                key: '$filter',
                value: "".concat(qd.filters.join()),
            });
        }
    }
    if (qd.groupby.length) {
        var group = "groupby((".concat(qd.groupby.join(', '), ")");
        if (qd.aggregator) {
            group += ", aggregate(".concat(qd.aggregator, ")");
        }
        params.push({
            key: '$apply',
            value: group + ')',
        });
    }
    if (qd.expands.length) {
        params.push({
            key: '$expand',
            value: "".concat(qd.expands.map(makeRelationQuery).join(',')),
        });
    }
    if (qd.select.length) {
        params.push({
            key: '$select',
            value: "".concat(qd.select.join(',')),
        });
    }
    if (qd.orderby.length) {
        params.push({
            key: '$orderby',
            value: "".concat(qd.orderby.join(', ')),
        });
    }
    if (qd.skip != null) {
        params.push({
            key: '$skip',
            value: "".concat(qd.skip),
        });
    }
    if (qd.take != null) {
        params.push({
            key: '$top',
            value: "".concat(qd.take),
        });
    }
    if (qd.count == true) {
        params.push({
            key: '$count',
            value: "true",
        });
    }
    return params;
}
exports.makeQuery = makeQuery;
function makeQueryParentheses(query) {
    if (query.indexOf(' or ') > -1 || query.indexOf(' and ') > -1) {
        return "(".concat(query, ")");
    }
    return query;
}
exports.makeQueryParentheses = makeQueryParentheses;
function makeRelationQuery(rqd) {
    var expand = rqd.key || '';
    if (rqd.strict) {
        expand += '!';
    }
    if (rqd.filters.length ||
        rqd.orderby.length ||
        rqd.select.length ||
        rqd.expands.length ||
        rqd.skip != null ||
        rqd.take != null ||
        rqd.count != false) {
        expand += "(";
        var operators = [];
        if (rqd.skip != null) {
            operators.push("$skip=".concat(rqd.skip));
        }
        if (rqd.take != null) {
            operators.push("$top=".concat(rqd.take));
        }
        if (rqd.count == true) {
            operators.push("$count=true");
        }
        if (rqd.orderby.length) {
            operators.push("$orderby=".concat(rqd.orderby.join(',')));
        }
        if (rqd.select.length) {
            operators.push("$select=".concat(rqd.select.join(',')));
        }
        if (rqd.filters.length) {
            if (rqd.filters.length > 1) {
                operators.push("$filter=".concat(rqd.filters.map(makeQueryParentheses).join(' and ')));
            }
            else {
                operators.push("$filter=".concat(rqd.filters.join()));
            }
        }
        if (rqd.expands.length) {
            operators.push("$expand=".concat(rqd.expands.map(makeRelationQuery).join(',')));
        }
        expand += operators.join(';') + ')';
    }
    return expand;
}
exports.makeRelationQuery = makeRelationQuery;
//# sourceMappingURL=query-builder.js.map
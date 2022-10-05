import { createQuery } from './create-query';
export function groupbyBuilder(aggregator = []) {
    const custom = (prop, aggreg, as) => groupbyBuilder(aggregator.concat(`${prop} with ${aggreg} as ${as}`));
    return {
        aggregator,
        sum(prop, as) {
            return custom(prop, 'sum', as);
        },
        min(prop, as) {
            return custom(prop, 'min', as);
        },
        max(prop, as) {
            return custom(prop, 'max', as);
        },
        average(prop, as) {
            return custom(prop, 'average', as);
        },
        countdistinct(prop, as) {
            return custom(prop, 'countdistinct', as);
        },
        custom,
    };
}
export function createGroupby(descriptor) {
    return (keys, aggregate) => {
        const agg = groupbyBuilder();
        const result = aggregate?.(agg) || agg;
        return createQuery({
            ...descriptor,
            groupby: keys.map(String),
            aggregator: result.aggregator.join(', ') || null,
        });
    };
}
//# sourceMappingURL=create-groupby.js.map
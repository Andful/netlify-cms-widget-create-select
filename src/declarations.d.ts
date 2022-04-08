declare module 'netlify-cms-ui-default' {
    import { StylesConfig, GroupBase } from 'react-select';
    export const reactSelectStyles: StylesConfig<string, boolean, GroupBase<string>>;
}

declare module 'netlify-cms-lib-widgets' {
    import { List } from 'immutable';
    export const validations: {
        validateMinMax: (
            t: (key: string, options: unknown) => string,
            fieldLabel: string,
            value?: List<unknown>,
            min?: number,
            max?: number,
        ) => {
            type: string,
            message: string,
        }
    };
}

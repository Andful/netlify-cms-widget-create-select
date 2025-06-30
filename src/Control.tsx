import React from 'react';
import CreatableSelect from 'react-select/creatable';
// @ts-ignore
import { reactSelectStyles } from 'decap-cms-ui-default';
// @ts-ignore
import { validations } from 'decap-cms-lib-widgets';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fromJS, List } from 'immutable';
import { ColourOption, colourOptions } from './data';

class NoOptionsError extends Error {
  constructor(message: string) {
    super(message);
  }
  get isNoOptionsError(): boolean {
    return true;
  }
}

interface SelectOption {
  value: string;
  label: string;
}

interface Config {
  url: string | undefined;
  query: string | undefined;
  attribute: string | undefined;
  filter: string | undefined;
  capture: string | undefined;
}

abstract class Loader {
  config: Config;
  filter: RegExp | undefined;
  capture: RegExp | undefined;
  constructor(config: Config) {
    this.config = config;
    if (this.config.filter !== undefined) {
      this.filter = new RegExp(this.config.filter);
    }
    if (this.config.capture !== undefined) {
      this.capture = new RegExp(this.config.capture);
    }
  }

  async getOptions(): Promise<SelectOption[]> {
    if (this.config.url === undefined) {
      throw new NoOptionsError('No options due to missing field "url"');
    }

    let response = await fetch(this.config.url);
    if (response.status !== 200) {
      throw new NoOptionsError(
        `No options due to response status ${response.status}`
      );
    }
    let options = await this.getLoaderOptions(response);

    if (this.filter !== undefined) {
      options = options.filter(o => o.match(this.filter as RegExp) !== null);
    }
    if (this.capture !== undefined) {
      options = options
        .map(o => o.match(this.capture as RegExp))
        .filter(m => m !== null)
        .map(m => (m as RegExpMatchArray)[0]);
    }

    return options.map(v => ({ value: v, label: v }));
  }

  abstract getLoaderOptions(_response: Response): Promise<string[]>;
}

class XMLLoader extends Loader {
  async getLoaderOptions(response: Response): Promise<string[]> {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(await response.text(), 'text/xml');

    if (this.config.query === undefined) {
      throw new NoOptionsError(
        'No options due to missing field "query" which is required for mode: "xml"'
      );
    }

    let elements = [...xmlDoc.querySelectorAll(this.config.query)];
    let options = elements
      .map(e => {
        if (this.config.attribute !== undefined) {
          let value = e.getAttribute(this.config.attribute);
          if (value === null) {
            return undefined;
          }
          return value as string;
        } else {
          let value = e.textContent;
          if (value === null) {
            return undefined;
          }
          return value as string;
        }
      })
      .filter(v => v !== undefined) as string[];

    return options;
  }
}

class HTMLLoader extends Loader {
  async getLoaderOptions(response: Response): Promise<string[]> {
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(await response.text(), 'text/html');

    if (this.config.query === undefined) {
      throw new NoOptionsError(
        'No options due to missing field "query" which is required for mode: "html"'
      );
    }

    let elements = [...htmlDoc.querySelectorAll(this.config.query)];
    let options = elements
      .map(e => {
        if (this.config.attribute !== undefined) {
          let value = e.getAttribute(this.config.attribute);
          if (value === null) {
            return undefined;
          }
          return value as string;
        } else {
          let value = e.textContent;
          if (value === null) {
            return undefined;
          }
          return value as string;
        }
      })
      .filter(v => v !== undefined) as string[];

    return options;
  }
}

class JSONLoader extends Loader {
  async getLoaderOptions(response: Response): Promise<string[]> {
    let originalObj = await response.json();

    let obj = fromJS(originalObj);

    if (this.config.query !== undefined) {
      obj = obj.getIn(this.config.query);
    }
    if (!List.isList(obj)) {
      throw new NoOptionsError(
        `No options due to "${
          this.config.query === undefined ? '.' : this.config.query
        }" not being an array in json ${JSON.stringify(originalObj)}`
      );
    }
    obj = obj as List<any>;
    let options = obj
      .map((e: any) => {
        if (this.config.attribute !== undefined) {
          return e.getIn(this.config.attribute.split('.'));
        }
        return e;
      })
      .filter((e: any) => e !== undefined)
      .map((e: any) => {
        if (typeof e === 'string') {
          return e;
        } else {
          return JSON.stringify(e);
        }
      }) as string[];
    return options;
  }
}

class PlainLoader extends Loader {
  async getLoaderOptions(response: Response): Promise<string[]> {
    let text = await response.text();
    let options = text.split('\n').filter(e => e !== '');
    return options;
  }
}

class NoModeLoader extends Loader {
  async getLoaderOptions(): Promise<string[]> {
    throw new NoOptionsError('No options due to missing field "mode"');
  }
}

interface Props {
  onChange: (_value: List<string> | string | undefined) => void;
  forID: string;
  value: List<string> | string;
  field: Map<string, any>;
  classNameWrapper: string;
  setActiveStyle: () => void;
  setInactiveStyle: () => void;
  hasActiveStyle: () => void;
  t: (_a: string, _b: any) => string;
}

interface State {
  isLoading: boolean;
  hasNoOptionMessage: string | null;
  options: Map<string, SelectOption>;
}

export default class Control extends React.Component<Props, State> {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
    hasActiveStyle: PropTypes.func,
    t: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      hasNoOptionMessage: null,
      options: new Map(),
    };
  }

  isValid = () => {
    const { field, value, t } = this.props;
    const isMultiple = (field.get('multiple') || false) as boolean;

    const min = field.get('min');
    const max = field.get('max');

    if (!isMultiple) {
      return { error: false };
    }

    const error = validations.validateMinMax(
      t,
      field.get('label') || field.get('name'),
      value,
      min,
      max
    );

    return error ? { error } : { error: false };
  };

  async componentDidMount() {
    const { value, field, onChange } = this.props;
    const isMultiple = (field.get('multiple') || false) as boolean;
    const url = field.get('url');
    const mode = field.get('mode');
    const query = field.get('query');
    const attribute = field.get('attribute');
    const filter = field.get('filter');
    const capture = field.get('capture');

    if (isMultiple) {
      if (value === undefined || value === null) {
        onChange(List());
      } else {
        if (List.isList(value)) {
          onChange(value);
        } else {
          onChange(fromJS([value]));
        }
      }
    } else {
      if (value === undefined || value === null) {
        onChange(undefined);
      } else {
        onChange(value);
      }
    }

    const config: Config = {
      url,
      query,
      attribute,
      filter,
      capture,
    };

    let loader: Loader;

    if (mode === 'xml') {
      loader = new XMLLoader(config);
    } else if (mode === 'html') {
      loader = new HTMLLoader(config);
    } else if (mode === 'json') {
      loader = new JSONLoader(config);
    } else if (mode === 'plain') {
      loader = new PlainLoader(config);
    } else {
      loader = new NoModeLoader(config);
    }

    let optionsMap = new Map<string, SelectOption>();
    try {
      let options = await loader.getOptions();
      options.forEach(e => {
        optionsMap.set(e.value, e);
      });
      this.setState({ isLoading: false, hasNoOptionMessage: null, options: optionsMap });
    } catch(e: any) {
      if (e.isNoOptionsError) {
        this.setState({ isLoading: false, hasNoOptionMessage: e.message, options: new Map() });
      } else {
        this.setState({ isLoading: false, hasNoOptionMessage: `No options due to: "${e}"`, options: new Map() });
      }
      
    }
    
  }

  render() {
    let {
      value,
      field,
      forID,
      classNameWrapper,
      setActiveStyle,
      setInactiveStyle,
      onChange,
    } = this.props;

    const isMultiple = (field.get('multiple') || false) as boolean;
    const isClearable = !(field.get('required') || !isMultiple) as boolean;

    const { isLoading, hasNoOptionMessage, options } = this.state;
    value =
      value !== undefined && value !== null
        ? typeof value === 'string'
          ? List([value])
          : value
        : List([]);
    let labeledValues = value
      .filter(v => v !== undefined)
      .map(v => {
        let e = options.get(v as string);
        if (e !== undefined && e !== null) {
          return e;
        } else {
          return { value: v as string, label: v as string };
        }
      });

      /*
const filterColors = (inputValue: string) => {
  return colourOptions.filter((i) =>
    i.label.toLowerCase().includes(inputValue.toLowerCase())
  );
};

const promiseOptions = (inputValue: string) =>
  new Promise<ColourOption[]>((resolve) => {
    setTimeout(() => {
      resolve(filterColors(inputValue));
    }, 1000);
  });

return (
  <CreatableSelect isMulti options={colourOptions} />
);
*/

    return (
      <CreatableSelect 
        isLoading={isLoading}
        value={labeledValues.toArray()}
        inputId={forID}
        //defaultOptions
        options={[...options.values()]}
        getNewOptionData={e => {
          if (value.includes(e)) {
            return { value: e, label: e };
          } else {
            return { value: e, label: `Create "${e}"` };
          }
        }}
        getOptionLabel={(e: SelectOption) => e.label}
        getOptionValue={(e: SelectOption) => e.value}
        onChange={(
          val: readonly SelectOption[] | SelectOption | null | undefined
        ) => {
          if (Array.isArray(val)) {
            onChange(List(val.map(e => e.value)));
          } else if (val !== null && val !== undefined) {
            onChange((val as SelectOption).value);
          } else {
            onChange(undefined);
          }
        }}
        noOptionsMessage={() => hasNoOptionMessage === null ? 'No options' : hasNoOptionMessage}
        className={classNameWrapper}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
        styles={reactSelectStyles}
        isMulti={isMultiple}
        isClearable={isClearable}
        placeholder={""}
      />
    );
  }
}

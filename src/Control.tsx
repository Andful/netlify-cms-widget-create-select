import React from 'react';
import { Creatable }  from 'react-select';
// @ts-ignore
import { reactSelectStyles } from 'netlify-cms-ui-default';
// @ts-ignore
import { validations } from 'netlify-cms-lib-widgets';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';

interface GetOptionResult {
  options: SelectOption[],
  noOptionMessage: string,
}

interface SelectOption {
  value: string,
  label: string,
}

interface Config {
  mode: string | undefined,
  url: string | undefined,
  query: string | undefined,
  attribute: string | undefined,
  filter: string | undefined,
  capture: string | undefined,
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
  async fetchData(url: string): Promise<Response> {
    return await fetch(url);
  }
  abstract parse(_response: Response): Promise<string[]>;

  async getOptions(): Promise<GetOptionResult> {
    let response : Response | null = null;
    let noOptionMessage = 'No options';

    if (this.config.mode === undefined) {
      return { options: [], noOptionMessage: `No options due to missing parameter "mode"`}
    }

    if (this.config.url === undefined) {
      return { options: [], noOptionMessage: `No options due to missing parameter "url"`}
    }

    if ((this.config.mode === "html" || this.config.mode === "xml") && this.config.query === undefined) {
      return { options: [], noOptionMessage: `No options due to missing parameter "query" which is required in "html" and "xml" mode`}
    }

    try {
      response = await this.fetchData(this.config.url);
      if (response.status !== 200) {
        noOptionMessage = `No options due to response code ${response.status}`
      }
    } catch(e) {
      noOptionMessage = `No options due to: "${e}"`
    }
  
    let options: string[] = response !== null ? await this.parse(response) : [];

    if (this.filter !== undefined) {
      options = options.filter(o => o.match(this.filter as RegExp) !== null)
    }

    if (this.capture !== undefined) {
      options = options.map(o => o.match(this.capture as RegExp)).filter(m => m !== null).map(m => (m as RegExpMatchArray)[0])
    }
    
    options.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : +1);
    return { options: options.map(value => ({value, label: value})), noOptionMessage};
  }
}

class XMLLoader extends Loader {
  async parse(response: Response): Promise<string[]> {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(
      await response.text(),
      'text/xml'
    );

    if (this.config.query === undefined) {
      return [];
    }

    let elements = [...xmlDoc.querySelectorAll(this.config.query)];
    return elements.map(e => {
      if (this.config.attribute !== undefined) {
        let value = e.getAttribute(this.config.attribute);
        if (value === null) {
          value = "";
        }
        return value;
      } else {
        let value = e.textContent;
        if (value === null) {
          value = "";
        }
        return value;
      }
    })
  }
}

class HTMLLoader extends Loader {
  async parse(response: Response): Promise<string[]> {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(
      await response.text(),
      'text/html'
    );

    if (this.config.query === undefined) {
      return [];
    }

    let elements = [...xmlDoc.querySelectorAll(this.config.query)];
    return elements.map(e => {
      if (this.config.attribute !== undefined) {
        return e.getAttribute(this.config.attribute);
      } else {
        return e.textContent;
      }
    }).filter(e => e !== null) as string[]
  }
}

class JSONLoader extends Loader {
  async parse(response: Response): Promise<string[]> {
    let obj = await response.json();

    if (this.config.query !== undefined) {
      this.config.query.split('.').forEach(q => {
        if (obj !== undefined) {
          obj = obj[q];
        }
      })
    }
    if (!Array.isArray(obj)) {
      throw new Error(`"${this.config.query === undefined ? "." : this.config.query}" is not an array in json ${JSON.stringify(obj)}`)
    }
    obj = obj as any[];
    return obj.map((e: any) => {
      if (this.config.attribute !== undefined) {
        this.config.attribute.split('.').forEach(attr => {
          if (e !== undefined) {
            e = e[attr];
          }
        })
      }
      return e;
    })
    .filter((e: any) => e !== undefined)
    .map((e: any) => {
      if (typeof e === "string") {
        return e;
      } else {
        return JSON.stringify(e);
      }
    });
  }
}

class PlainLoader extends Loader {
  async parse(response: Response): Promise<string[]> {
    let text = await response.text();
    return text.split("\n").filter(e => e !== "");
  }
}



interface Props {
  onChange: (_value: List<string> | string | undefined) => void,
  forID: string,
  value: List<string> | string,
  field: Map<string, any>,
  classNameWrapper: string,
  setActiveStyle: () => void,
  setInactiveStyle: () => void,
  hasActiveStyle: () => void,
  t: (_a: string, _b: any) => string,
}

interface State {
  isLoading: boolean,
  noOptionMessage: string,
  options: Map<string,SelectOption>
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
    this.state = { isLoading: true, noOptionMessage: "No options", options: new Map() };
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
      max,
    );

    return error ? { error } : { error: false };
  };



  async componentDidMount() {
    const { field } = this.props;
    const url = field.get('url');
    const mode = field.get('mode');
    const query = field.get('query');
    const attribute = field.get('attribute');
    const filter = field.get('filter');
    const capture = field.get('capture');

    const config: Config = {
      url,
      mode,
      query,
      attribute,
      filter,
      capture,
    }

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
      loader = new PlainLoader(config);
    }

    let optionsMap = new Map<string, SelectOption>();
    let {options, noOptionMessage} = await loader.getOptions();
    options.forEach(e => {
      optionsMap.set(e.value, e);
    })
    this.setState({ isLoading: false, noOptionMessage, options: optionsMap });
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

    const { isLoading, noOptionMessage , options } = this.state;
    value = value !== undefined && value !== null ? (typeof value === "string" ? List([value]) : value) : List([])
    let labeledValues = value
    .filter(v => v !== undefined)
    .map(v => {
      let e = options.get(v as string);
      if (e !== undefined && e !== null) {
        return e;
      } else {
        return {value: v as string, label: v as string};
      }
    });

    return (
      <Creatable
        isLoading={isLoading}
        value={labeledValues.toArray()}
        inputId={forID}
        defaultOptions
        options={[...options.values()]}
        getNewOptionData={e => {
          if (value.includes(e)) {
            return {value: e, label: e};
          } else {
            return {value: e, label: `Create "${e}"`};
          }
        }}
        getOptionLabel={e => e.label}
        getOptionValue={e => e.value}
        onChange={(val: readonly SelectOption[] | SelectOption | null | undefined) => {
          if (Array.isArray(val)) {
            onChange(List(val.map(e => e.value)))
          } else if (val !== null && val !== undefined) {
            onChange((val as SelectOption).value);
          } else {
            onChange(undefined);
          }
        }}
        className={classNameWrapper}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
        noOptionsMessage={() => noOptionMessage}
        styles={reactSelectStyles}
        isMulti={isMultiple}
        isClearable={isClearable}
        placeholder=""
      />
    );
  }
}
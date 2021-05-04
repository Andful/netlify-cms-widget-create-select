import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Creatable } from 'react-select';
import { fromJS, OrderedMap, toJSON } from 'immutable';
import { isNumber } from 'lodash';
import { reactSelectStyles } from 'netlify-cms-ui-default';

export default class Control extends React.Component {
  didInitialSearch = false;

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
    hasActiveStyle: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { isLoading: true, options: [] };
  }

  isValid = () => {
    const { field, value, t } = this.props;
    const min = field.get('min');
    const max = field.get('max');
    const minMaxError = messageKey => ({
      error: {
        message: t(`editor.editorControlPane.widget.${messageKey}`, {
          fieldLabel: field.get('label', field.get('name')),
          minCount: min,
          maxCount: max,
          count: min,
        }),
      },
    });

    if (!field.get('multiple')) {
      return { error: false };
    }

    if (
      [min, max].every(isNumber) &&
      value?.length &&
      (value.length < min || value.length > max)
    ) {
      return minMaxError(min === max ? 'rangeCountExact' : 'rangeCount');
    } else if (
      isNumber(min) &&
      min > 0 &&
      value?.length &&
      value.length < min
    ) {
      return minMaxError('rangeMin');
    } else if (isNumber(max) && value?.length && value.length > max) {
      return minMaxError('rangeMax');
    }
    return { error: false };
  };

  loadOptions(optionsData, getLabel, getValue, filterFunction) {
    let options = OrderedMap(
      Object.fromEntries(
        optionsData
          .filter(filterFunction)
          .map(e => ({ label: getLabel(e), value: getValue(e) }))
          .map(option => [option.value, option])
      )
    );
    this.setState({ isLoading: false, options });
  }

  async componentDidMount() {
    const { field } = this.props;
    const url = field.get('url');
    const mode = field.get('mode');
    const dataKey = field.get('dataKey');
    const valueField = field.get('valueField');
    const displayField = field.get('displayField') || valueField;
    const filter = field.get('filter');

    if (url === undefined) {
      throw new TypeError('"url" is a required field');
    }
    if (mode === undefined) {
      throw new TypeError('"mode" is a required field');
    }

    let optionsData;
    let getLabel;
    let getValue;
    let filterFunction;

    let response = await fetch(url);

    if (mode === 'xml' || mode === 'html') {
      if (dataKey === undefined) {
        throw new TypeError('"dataKey" is a required field with "mode: xml"');
      }
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(
        await response.text(),
        mode === 'xml' ? 'text/xml' : 'text/html'
      );
      optionsData = [...xmlDoc.querySelectorAll(dataKey)];

      if (valueField === undefined) {
        getValue = e => e.textContent;
      } else if (typeof valueField === 'string') {
        getValue = e => e.querySelector(valueField).textContent;
      } else if (typeof valueField === 'function') {
        getValue = valueField;
      } else {
        throw new TypeError('"valueField" has wrong type');
      }

      if (displayField === undefined) {
        getLabel = e => e.textContent;
      } else if (typeof displayField === 'string') {
        getLabel = e => e.querySelector(displayField).textContent;
      } else if (typeof displayField === 'function') {
        getLabel = displayField;
      } else {
        throw new TypeError('"displayField" has wrong type');
      }
    } else if (mode === 'json') {
      let json = fromJS(await response.json());
      optionsData = dataKey !== undefined ? json.get(dataKey) : json;

      if (valueField === undefined) {
        getValue = e => toJSON(e);
      } else if (typeof valueField === 'string') {
        getValue = e => e.getIn(valueField.split('.'));
      } else if (typeof valueField === 'function') {
        getValue = valueField;
      } else {
        throw new TypeError('"valueField" has wrong type');
      }

      if (displayField === undefined) {
        getLabel = e => toJSON(e);
      } else if (typeof displayField === 'string') {
        getLabel = e => e.getIn(displayField.split('.'));
      } else if (typeof displayField === 'function') {
        getLabel = displayField;
      } else {
        throw new TypeError('"displayField" has wrong type');
      }
    } else if (mode === 'plain') {
      let text = await response.text();
      optionsData = text.split('\n');

      if (valueField === undefined) {
        getValue = e => e;
      } else if (typeof valueField === 'function') {
        getValue = valueField;
      } else {
        throw new TypeError('"valueField" has wrong type');
      }

      if (displayField === undefined) {
        getLabel = e => e;
      } else if (typeof displayField === 'function') {
        getLabel = displayField;
      } else {
        throw new TypeError('"displayField" has wrong type');
      }
    } else {
      throw new TypeError(`unknown mode "${mode}"`);
    }

    if (filter === undefined) {
      filterFunction = () => true;
    } else if (typeof filter === 'string') {
      filterFunction = e => getValue(e).match(new RegExp(filter));
    } else if (typeof filter === 'function') {
      filterFunction = filter;
    } else {
      throw new TypeError('"filter" has wrong type');
    }

    this.loadOptions(optionsData, getLabel, getValue, filterFunction);
  }

  render() {
    const {
      value,
      field,
      forID,
      classNameWrapper,
      setActiveStyle,
      setInactiveStyle,
      onChange,
    } = this.props;
    const isMultiple = field.get('multiple', false);
    const isClearable = !field.get('required', true) || isMultiple;

    const { isLoading, options } = this.state;

    return (
      <Creatable
        isLoading={isLoading}
        value={
          value !== undefined ? (Array.isArray(value) ? value : [value]) : []
        }
        inputId={forID}
        defaultOptions
        options={[...options.keys()]}
        getNewOptionData={e => e}
        getOptionLabel={e => {
          let option = this.state.options.get(e);
          if (option !== undefined) {
            return option.label;
          } else {
            if (
              value !== undefined &&
              ((Array.isArray(value) && value.includes(e)) || value === e)
            ) {
              return e;
            } else {
              return `Create "${e}"`;
            }
          }
        }}
        getOptionValue={e => e}
        onChange={onChange}
        className={classNameWrapper}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
        styles={reactSelectStyles}
        isMulti={isMultiple}
        isClearable={isClearable}
        placeholder=""
      />
    );
  }
}

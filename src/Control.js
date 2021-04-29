import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Creatable } from 'react-select';
import { List, fromJS } from 'immutable';
import { reactSelectStyles } from 'netlify-cms-ui-default';
import { capitalize } from 'lodash';

export default class Control extends React.Component {
  didInitialSearch = false;

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    fetchID: PropTypes.string,
    query: PropTypes.func.isRequired,
    queryHits: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
    hasActiveStyle: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { options: [] };
  }

  static capitalize(s) {
    s.replaceAll(/\b[a-z]/g, m => m.toUpperCase());
  }

  async componentDidMount() {
    const { field } = this.props;
    const url = field.get('url');

    let options = await fetch(url)
      .then(data => data.json())
      .then(json => fromJS(json));

    this.setState({ options });
  }

  componentDidUpdate(prevProps) {
    /**
     * Load extra post data into the store after first query.
     */
    if (this.didInitialSearch) return;
    const { value, field, forID, queryHits, onChange } = this.props;
    if (
      queryHits !== prevProps.queryHits &&
      queryHits.get !== undefined &&
      queryHits.get(forID)
    ) {
      this.didInitialSearch = true;
      const valueField = field.get('valueField');
      const hits = queryHits.get(forID);
      if (value) {
        const listValue = List.isList(value) ? value : List([value]);
        listValue.forEach(val => {
          const hit = hits.find(i => i.data[valueField] === val);
          if (hit) {
            onChange(value, {
              [field.get('name')]: {
                [field.get('collection')]: { [val]: hit.data },
              },
            });
          }
        });
      }
    }
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

    const { options } = this.state;

    return (
      <Creatable
        value={
          value !== undefined ? (Array.isArray(value) ? value : [value]) : []
        }
        inputId={forID}
        defaultOptions
        options={options}
        getNewOptionData={e => e.toLowerCase()}
        getOptionValue={e => e}
        getOptionLabel={e => capitalize(e)}
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

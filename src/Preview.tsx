import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map } from 'immutable';

interface PreviewProps {
  field: Map<string, any>,
  value: string[] | string,
}

export default function Preview(props: PreviewProps) {
  const { field, value } = props;
  let displayValue = props.value;

  if (field.get('multiple')) {
    displayValue = (value as string[]).join(', ');
  }
  return <div>{displayValue}</div>;
}

Preview.propTypes = {
  value: PropTypes.node,
  field: ImmutablePropTypes.map,
};

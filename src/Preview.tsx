import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map } from 'immutable';
// @ts-ignore
import { CmsWidgetPreviewProps } from 'decap-cms-lib-widgets';

interface PreviewProps {
  field: Map<string, any>,
  value: string[] | string,
}

const Preview: React.FC<CmsWidgetPreviewProps<unknown>> = props => {
  const { field, value } = props;
  let displayValue = props.value;

  if (field.get('multiple')) {
    displayValue = (value as string[]).join(', ');
  }
  return <div>{displayValue}</div>;
}

export default Preview;

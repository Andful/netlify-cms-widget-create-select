import './bootstrap';
// @ts-ignore
import CMS, { init } from 'decap-cms';
import 'decap-cms/dist/cms.css';
import CreatableSelectWidget from '../src/index';

CMS.registerWidget(
  'create-select',
  CreatableSelectWidget.CreatableSelectControl,
  CreatableSelectWidget.CreatableSelectPreview
);



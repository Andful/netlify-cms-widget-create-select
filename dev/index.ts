import './bootstrap';
// @ts-ignore
import CMS from 'decap-cms-app';
import 'decap-cms/dist/cms.css';
import CreatableSelectWidget from '../src/index';

CMS.registerWidget(
  'create-select',
  CreatableSelectWidget.CreatableSelectControl,
  CreatableSelectWidget.CreatableSelectPreview
);

CMS.init();



import './bootstrap.js';
import CMS, { init } from 'netlify-cms';
import 'netlify-cms/dist/cms.css';
import CreatableSelectWidget from '../src';

const config = {
  backend: {
    name: 'test-repo',
    login: false,
  },
  media_folder: 'assets',
  collections: [
    {
      name: 'test',
      label: 'Test',
      files: [
        {
          file: 'test.yml',
          name: 'test',
          label: 'Test',
          fields: [
            {
              name: 'hugo-tags',
              label: 'Hugo Tags (XML)',
              widget: 'create-select',
              url: '/dev/data/index.xml',
              dataKey: 'item',
              valueField: 'title',
              displayField: 'title',
              mode: 'xml',
            },
            {
              name: 'jekyll-tags',
              label: 'Jekyll Tags (HTML)',
              widget: 'create-select',
              url: 'https://mmistakes.github.io/so-simple-theme/tags/',
              dataKey: '.taxonomy-index > li > a > strong',
              mode: 'html',
              multiple: true,
              min: 1,
              max: 5,
            },
            {
              name: 'json',
              label: 'Json',
              widget: 'create-select',
              url: 'https://jsonplaceholder.typicode.com/users',
              valueField: 'id',
              displayField: 'name',
              mode: 'json',
            },
            {
              name: 'plain',
              label: 'Plain',
              widget: 'create-select',
              url: '/dev/data/plain-text.txt',
              mode: 'plain',
            },
          ],
        },
      ],
    },
    {
      name: 'posts',
      label: 'Posts',
      create: true,
      slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
      folder: '_posts',

      fields: [
        { label: 'Title', name: 'title', widget: 'string', tagname: 'h1' },
        {
          label: 'Publish Date',
          name: 'date',
          widget: 'datetime',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        },
        {
          label: 'Cover Image',
          name: 'image',
          widget: 'image',
          required: false,
          tagname: '',
        },
        {
          label: 'Body',
          name: 'body',
          widget: 'markdown',
          hint: 'Main content goes here.',
        },
      ],
      //meta: [{ label: 'SEO Description', name: 'description', widget: 'text' }],
    },
  ],
};

CMS.registerWidget(
  'create-select',
  CreatableSelectWidget.CreatableSelectControl,
  CreatableSelectWidget.CreatableSelectPreview
);

init({ config });

# netlify-cms-widget-create-select

[Check out a demo!](https://netlify-cms-widget-create-select.netlify.app/#/collections/test/entries/test)

A simple create select widget for netlify-cms which allows creating entries. The create select widget's entries are up to date to the last website build. The create select can be populated by plain text file, json file, RSS feed or HTML page. 

## Install

As an npm package:

```shell
npm install --save netlify-cms-widget-create-select
```

```js
import { CreatableSelectControl, CreatableSelectPreview } from 'netlify-cms-widget-create-select'

CMS.registerWidget('create-select', CreatableSelectControl, CreatableSelectPreview);
```

Via `script` tag:

```html
<script src="https://unpkg.com/netlify-cms-widget-create-select@^1.0.0"></script>

<script>
  CMS.registerWidget('create-select', window.CreatableSelectControl, window.CreatableSelectPreview)
</script>
```

## How to use

Add to your Netlify CMS configuration:

```yaml
    fields:
      - { 
          name: 'test_widget',
          label: 'Test Widget',
          widget: 'create-select',
          url: 'https://jsonplaceholder.typicode.com/users',
          valueField: 'id',
          displayField: 'name',
        },
```

## Configuration

Async-select widgets may have the following properties in addition to the defaults used by netlity.

---

`mode` - string - **required**

Endpoint file type possible values being `"html"`, `"xml"`, `"json"`, `"plain"`.

---

`url` - string - **required**

The URI of the endpoint which to request the file to populate the select options.

---

`valueField` - string - **required**

Field in the data response which will be mapped to the value of the netlify widget once populated.

---

`displayField` - string - **optional** 

default: `valueField`

Field in the data response which will be mapped to the display text of the netlify widget once populated.

---

`dataKey` - string - **optional (required for modes `"html"` and `"xml"`)** 

Field in the data response which will be used for the source of the data.  

For example, given the below data structure, you may set `dataKey: 'data'` to populate the select dropdown as expected.

Example:
```javascript
{
    meta: {
        page: 1,
        total: 10
        ...
    }
    data: [{
        id: 1,
        name: 'user 1',
        email: 'foo@bar.com'
    },{
        ...
    }]
}
``` 

---



## Support

For help with this widget, open an [issue](https://github.com/chrisboustead/netlify-cms-widget-async-select) or ask the Netlify CMS community in [Gitter](https://gitter.im/netlify/netlifycms).

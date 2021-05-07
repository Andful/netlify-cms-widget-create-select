# netlify-cms-widget-create-select

[Check out a demo!](https://andful.github.io/netlify-cms-widget-create-select)

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
<script src="https://unpkg.com/netlify-cms-widget-create-select@^1.1.0"></script>

<script>
  CMS.registerWidget('create-select', window.CreatableSelectControl, window.CreatableSelectPreview)
</script>
```
## How to use
### Integrate with HTML page

If the built page has all the options you want in a specific html page you can scrape the options from that page.  
For example let's say `https://www.example.com/tags/` contains the following html page.
```html
<!DOCTYPE html>
<html>
<head></head>
<body>
    <ol id="tag-list">
        <li class="tag" data-tag="tag-1">Tag 1</li>
        <li class="tag" data-tag="tag-2">Tag 2</li>
        <li class="tag" data-tag="tag-3">Tag 3</li>
    </ol>
</body>
</html>
```
You can query the options `tag-1`, `tag-2`, `tag-3` with the following configuration
```yaml
fields:
  - name: 'tags'
    label: 'Tags'
    widget: 'create-select'
    mode: 'html'
    url: 'https://www.example.com/tags/'
    query: '#tag-list > .tag'
    attribute: 'data-tag'
    multiple: true
```
### Integrating with `sitemap.xml`
You can deduce the tags using the `sitemap.xml` file. For example if you want to match the string `https://www.example.com/tags/<tag-value>/` you can do it the following way.
```yaml
- name: 'sitemap'
    label: 'Sitemap Example'
    widget: 'create-select'
    mode: 'xml'
    url: 'sitemap.xml'
    query: 'loc'
    capture: '(?<=https:\/\/www\.example\.com\/\/tags\/).+(?=\/\b)'
    multiple: true
```

### Integrate with HUGO RSS feed

Many HUGO website have `/tags/index.xml` page with the RSS feed of the tags. An example of the structure of such files is:
```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tags on Hugo Themes</title>
    <link>https://www.example.com/tags/</link>
    <description>Recent content in Tags on Hugo Themes</description>
    <generator>Hugo -- gohugo.io</generator>
    <atom:link href="https://www.example.com/tags/index.xml" rel="self" type="application/rss+xml" />
    <item>
      <title>tag1</title>
      <link>https://www.example.com/tags/tag-1/</link>
      <pubDate>Mon, 11 Mar 2019 00:00:00 +0000</pubDate>
      
      <guid>https://www.example.com/tags/tag-1/</guid>
      <description></description>
    </item>
    
    <item>
      <title>tag2</title>
      <link>https://www.example.com/tags/tag-2/</link>
      <pubDate>Mon, 11 Mar 2019 00:00:00 +0000</pubDate>
      
      <guid>https://www.example.com/tags/tag-2/</guid>
      <description></description>
    </item>
  </channel>
</rss>
```
The RSS feed of the preview page can be used to populate the select widget.
This can be done the following way.
```yaml
fields:
  - name: 'tags'
    label: 'Tags'
    widget: 'create-select'
    mode: 'xml'
    url: 'https://www.example.com/tags/index.xml'
    query: 'item > title'
    multiple: true
```
### Integrate with HUGO using custom output.
Alternativelly you can make a custom output on the page to populate the select widget.  
* Make a custom output adding the following lines in the hugo `config.yaml` file
  ```yaml
  outputFormats:
    Ingredients:
        baseName: ingredients
        isPlainText: true
        mediaType: text/plain
  ```
* add a `layouts/_default/single.ingredients.txt` template file to generate the select options.
  ```
  {{- $scratch := .Scratch -}}
  {{- with .Site.GetPage "/recipes" -}}
    {{- range .Pages -}}
      {{- range .Params.ingredients -}}
        {{- $scratch.Set . true -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
  {{- range $key, $value := $scratch.Values -}}
  {{- $key -}}{{- "\n" -}}
  {{- end -}}
  ```
* add a markdown file with the followind front-matter. For example `content/ingredients.md`
  ```yaml
  ---
  _build:
    list: false #prevent file to be listed in sitemap.xml
  outputs: [ingredients]
  ---
  ```
* Now when you compile the page with the command `hugo` there should be a file generated called `public/ingredients.txt`. The content of the file should be similar to the following:
  ```
  olive oil
  salt
  sugar
  ```
* You can add the followind confin in the netlify `config.yml` to have a select widget query from the `ingredients.txt` file:
  ```yaml
  fields:
    - name: 'ingredients'
      label: 'Ingredients'
      widget: 'create-select'
      url: 'https://www.example.com/ingredients.txt'
      mode: 'plain'
      multiple: true
  ```
## Configuration

Create-select widgets may have the following properties in addition to the defaults used by netlity.

---

`mode` - string - **required**

Endpoint file type possible values being `"html"`, `"xml"`, `"json"`, `"plain"`.

---

`url` - string - **required**

The URI of the endpoint which to request the file to populate the select options.

---

`query` - string - **optional**

Query to obtain the data points.  
* With `xml` or `html` modes the query is a css selector e.g. `query: "div.chapter > .title"`. This field is **required**.
* With `json` mode query is a dot separated chain of attributes e.g. `query: "data.config.users"`. If not specified the root object will be used. Note that the query should give an array type.
* With `plain` mode this field will be ignored.
---

`attribute` - string - **optional** 

Attribute to use as value for each data points.
* With `xml` or `html` modes this is an attribute of the element e.g. `class`, `id`, `data-attr`. If not sepcified the `textContent` will be used instead.
* With `mode: json` query is a dot separated chain of attributes e.g. `query: "name.firstName"`. If not specified the root object will be used. Note that the query should give a string type.
* With `plain` mode this field will be ignored.
---

`filter` - string - **optional** 

Regex for whitch the matching data point's value will be used otherwise the data point is filtered out. The filtering happens before the string is captured.

---

`capture` - string - **optional** 

Regex for whitch the matching content will be used by the widget. E.g. `capture: "(?<=https:\\/\\/www\\.example\\.com\\/tags\\/).+(?=\\/)"` to capture `tag1` from the value `https://www.example.com/tags/tag1/`.  
If there is no match the data point will be removed.

---

`multiple` - boolean - **optional**
Allow multiple entries.

---

`min` - number - **optional**
Minimum number of entries.

---

`max` - number - **optional**
Maximum number of entries.

---



## Support

For help with this widget, open an [issue](https://github.com/Andful/netlify-cms-widget-create-select) or ask the Netlify CMS community in [Gitter](https://gitter.im/netlify/netlifycms).

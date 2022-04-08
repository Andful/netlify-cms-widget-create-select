import CMS from 'netlify-cms'
import { CreatableSelectControl, CreatableSelectPreview} from 'netlify-cms-widget-create-select'

CMS.registerWidget('create-select', CreatableSelectControl, CreatableSelectPreview)
CMS.init();



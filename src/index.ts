import CreatableSelectControl from './Control';
import CreatableSelectPreview from './Preview';

if (typeof window !== 'undefined') {
  (<any>window).CreatableSelectControl = CreatableSelectControl;
  (<any>window).CreatableSelectPreview = CreatableSelectPreview;
}

const exportObject = { CreatableSelectControl, CreatableSelectPreview };

export default exportObject;

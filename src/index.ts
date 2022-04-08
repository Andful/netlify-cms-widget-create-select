import CreatableSelectControl from './Control';
import CreatableSelectPreview from './Preview';

if (typeof window !== 'undefined') {
  (<any>window).CreatableSelectControl = CreatableSelectControl;
  (<any>window).CreatableSelectPreview = CreatableSelectPreview;
}

export { CreatableSelectControl, CreatableSelectPreview };

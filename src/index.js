import CreatableSelectControl from './Control';
import CreatableSelectPreview from './Preview';

if (typeof window !== 'undefined') {
  window.AsyncSelectControl = CreatableSelectControl;
  window.AsyncSelectPreview = CreatableSelectPreview;
}

const exportObject = {
  CreatableSelectControl,
  CreatableSelectPreview,
};

export default exportObject;

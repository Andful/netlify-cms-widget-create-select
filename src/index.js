import CreatableSelectControl from './Control';
import CreatableSelectPreview from './Preview';

if (typeof window !== 'undefined') {
  window.CreatableSelectControl = CreatableSelectControl;
  window.CreatableSelectPreview = CreatableSelectPreview;
}

const exportObject = {
  CreatableSelectControl,
  CreatableSelectPreview,
};

export default exportObject;

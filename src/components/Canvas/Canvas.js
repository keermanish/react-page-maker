import React from 'react';

import Dropzone from '../Dropzone/Dropzone';

// functional component which extends Dropzone but with some fixed properties - id and parentID
// both props set to `root` - required since application state holds `root` as parent node
// default initDone set to true
const Canvas = props => (
  <div className="main-canvas">
    <Dropzone {...props} parentID="root" id="root" initDone />
  </div>
);

export default Canvas;

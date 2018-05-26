# [React Page Maker](https://www.npmjs.com/package/react-page-maker)
[![npm version](https://badge.fury.io/js/react-page-maker.svg)](https://badge.fury.io/js/react-page-maker)

A react package which will help you to generate the **meta data(JSON)** based on the selection of UI elements.

Library provides feature of Drag and Drop, where you can drag the UI elements from palette and drop it into appropriate dropzone/canvas.

# Install #
```shell
npm install --save react-page-maker
```

[![Demo](https://img.youtube.com/vi/2yzeqrZA5v0/0.jpg)](https://www.youtube.com/watch?v=2yzeqrZA5v0)

# How to use #
1. Define the type of elements
2. Create and Register elements/layouts
3. Render Palette and Canvas
4. [Working example](https://github.com/keermanish/example-react-page-maker.git)


### Define the type of elements ###
  - Every element/layout has mandatory `type` property. It helps to render corresponding component.
    ```Javascript
    // Const.js
    export const elements = {
      TEXTBOX: 'TEXTBOX',
      LAYOUT_GRID_1_2: 'LAYOUT_GRID_1_2'
    };
    ```

### Create and Register elements/Layouts ###
  - **Create element**

    Elements/Layouts should have drag feature. To acheive the same we will use `Draggable` component.

    ```Javascript
    // DraggableTextbox.js
    import React from 'react';
    import PropTypes from 'prop-types';
    import { FormGroup, Input, Label } from 'reactstrap';
    import { Draggable } from 'react-page-maker'; // to give drag behaviour

    const DraggableTextbox = (props) => {
      // `showBasicContent` is default prop passed by `Palette` component
      const { showBasicContent, name } = props;

      if (showBasicContent) { // content to be shown in palette list
        return (
          <Draggable {...props}>
            <span>{name}</span>
          </Draggable>
        );
      }

      return ( // content to be shown in canvas
        <Draggable {...props}>
          <FormGroup>
            <Label>{name}</Label>
            <Input type="text" placeholder="Type here" />
          </FormGroup>
        </Draggable>
      );
    };

    DraggableTextbox.propTypes = {
      name: PropTypes.string,
      showBasicContent: PropTypes.bool
    };

    export default DraggableTextbox;

    ```
    Based on `showBasicContent` prop you can manage what content to be shown in Canvas and Palette. This is _default_ prop which will be available for all palette elements.

    **Note**- For drag behaviour, wrap the element with `Draggable` component and make sure all props gets passed to it.

  - **Create Layout** (If you want more complex/nested structure)

    Here steps are very similar to above but we would be having some dropzones where we can drop elements.

    ```Javascript
      // DraggableGrid_1_2.js
      import { Draggable, Dropzone } from 'react-page-maker';

      const DragItemGridLayout = (props) => {
        // make sure you are passing `dropzoneProps` prop to dropzone
        const { showBasicContent, dropzoneProps, ...rest } = props;

        if (showBasicContent) {
          return (
            <Draggable {...props} >
              <span>{ rest.name }</span>
            </Draggable>
          );
        }

        return (
          <Draggable {...props} >
            <span>{ rest.name }</span>
            <div className="grid-layout">
              <div className="row">
                <div className="col-sm-6">
                  <Dropzone {...dropzoneProps} id="canvas-1-1" />
                </div>
                <div className="col-sm-6">
                  <Dropzone {...dropzoneProps} id="canvas-1-2" />
                </div>
              </div>
            </div>
          </Draggable>
        );
      };
    ```
    **Note** -
      - Provide `id` and `dropzoneProps` to every dropzone
      - `dropzoneProps` is by default available under props


  - **Register Elements**
    ```Javascript
    import { registerPaletteElements } from 'react-page-maker';

    // pass array of elements which we want to use across
    registerPaletteElements([{
      type: elements.TEXTBOX, // import from const.js
      component: DraggableTextbox // import from DraggableTextbox.js
    }, {
      type: elements.LAYOUT_GRID_1_2,
      component: DragItemGridLayoutR1C2 // import from DraggableGrid_1_2.js
    }]);
    ```
    After this step, application will be aware what type of elements we have and based on this types we can create as many fields required.
    e.g. from `elements.TEXTBOX` we can create any text field (First Name, Last Name, etc.)

    **Note** - Call `registerPaletteElements` function before you render palette. e.g. Inside `constructor` or `componentWillMount`

### Render Palette and Canvas ###

  Pass list of elements which we need to show inside palette (since not every time we will be using all elements).

  ```Javascript
  import { Palette, Canvas } from 'react-page-maker';

  class PageConfigurator extends Component {
    constructor(props) {
      super(props);
      this.registerPaletteElements();
    }

    registerPaletteElements = () => {
      registerPaletteElements([{ // <-- registered palette elements
        type: elements.TEXTBOX,
        component: DraggableTextbox
      }, {
        type: elements.LAYOUT_GRID_1_2,
        component: DragItemGridLayoutR1C2
      }]);
    }

    paletteElements = [{ // <-- palette elements to be shown
      id: 'f1', // make sure ID is unique
      name: 'Input Field',
      type: elements.TEXTBOX
    }, {
      id: 'g1',
      name: 'Two Dropzones',
      type: elements.LAYOUT_GRID_1_2
    }]

    render() {
      return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-8 canvas-wrapper">
              <Canvas />
            </div>
            <div className="col-sm-4 palette-wrapper">
              <Palette paletteElements={this.paletteElements} />
            </div>
          </div>
        </div>
      );
    }
  }

  export default PageConfigurator;
  ```

  **Note** - Make sure every palette elements has unique ID.

  By now, you would be able to see Canvas and Palette (with those provided elements).


## Components ##

- **Draggable**

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | id      | String | ID of an element |
  | name      | String | Name of an element |
  | type      | String      |   Defines type of an element  |
  | payload | Object      |    Any custom data that you want to pass |

- **Palette**

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | paletteElements      | Array | Array of element(Object) to be shown inside palette |

- **Dropzone**

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | id      | String | ID of a dropzone |
  | capacity      | Number | Maximum number of elements dropzone can maintain  |
  | initialElements      | Array | Array of element(Object) to be prepopulate inside dropzone, here format will be similar to palette elements |
  | placeholder      | String | Text to be shown when dropzone is emepty. Default value is `Drop Here.` |
  | onDrop      | Function | function gets triggered once element got dropped |
  | onElementMove      | Function | Function get called when we try to move the element from one dropzone to another |

    ```Javascript
    /**
     * function gets triggered once element got dropped
     * @param {Object} data - It holds element information
     * @param {Function} cb - A callback function, which helps to decide whether to add element or not.
     * if data is valid then call cb function to proceed else return false.
     * @param {Number} dropIndex - Position where element getting dropped
     * @param {Array} currentElements - Current elements which canvas holds
     * @returns {cb/Boolean}
     */
    _onDrop = (data, cb, { dropIndex, currentElements }) => {
      //In order to mock user input I'm using `window.prompt`
      // in actual scenario we can add some async call to fetch data
      const name = window.prompt('Enter name of field');
      const id = window.prompt('Enter id of field');

      const result = cb({
        ...data,
        name: name || data.name,
        id: id || data.id
      });
    }

    /**
    * Function get called when we try to move the element from one dropzone to another
    * @param {Object} elementMoved - Data of element which has been moved
    * @returns {Boolean}
    */
    _onElementMove = (elementMoved) => (true);

    <Dropzone
      id="d1"
      capacity={4}
      initialElements={[]}
      placeholder="Drop Here"
      onDrop={this._onDrop}
      onElementMove={this._onElementMove}
      {...dropzoneProps}
    />
    ```

- **Canvas**
  This Component is extended version of Dropzone with some default properties (e.g. `ID`) in it.

- **Trash**

  You can use this component to have feature of trash/delete. Once element dropped in Trash it get removed from canvas and state.

  **Syntax**
    ```Javascript
    /**
      * Function get trigger just before element getting trashed
      * @param {Object} elementToBeTrashed - Data of element which is going to be trashed
      * @returns {Boolean}
      */
      _onBeforeTrash = (elementToBeTrashed) => {
        return true;
      }

      /**
      * Success function which gets triggered once element has been trashed
      */
      _onAfterTrash = () => {
        console.log('Updated state', state.getState());
      }

      <Trash onBeforeTrash={this._onBeforeTrash} onAfterTrash={this._onAfterTrash} />
    ```

## API ##

### State ###

  It provide access to the state object which holds all the meta data.

  - **Syntax**

    ```Javascript
    import { state } from 'react-page-maker';

    // Function to get current state of the canvas
    state.getState();

    /**
    * Function to flush canvas/current state
    * @param {Function} cb - success call back, function gets triggered once canvas is flushed
    */
    state.clearState(() => {
      console.log('Canvas has been flushed successfully')
    });

    /**
    * Function to add event
    * @param {String} event - name of event, For now we are supporting 'change' event
    * @param {Function} cb - function gets called upon event trigger
    * @param {Object} newState - new state
    * @returns {Function} - instance of attached function
    */
    const cb = state.addEventListener('change', (newState) => {
      console.log('new state', newState);
    });

    /**
    * Function to remove event
    * @param {String} event - name of event, For now we are supporting 'change' event
    * @param {Function} oldEventInstance - instance of previously attached event
    */
    state.removeEventListener('change', cb);
    ```


## Thanks ##
Please feel free to raise PR for any new feature or bug (if you find any).

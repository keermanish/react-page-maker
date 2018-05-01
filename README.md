# [React Page Maker](https://www.npmjs.com/package/react-page-maker)
[![npm version](https://badge.fury.io/js/react-page-maker.svg)](https://badge.fury.io/js/react-page-maker)

A react package which will help you to generate the **meta data(JSON)** based on the selection of UI elements.

Library provides feature of Drag and Drop, where you can drag the UI elements/layouts from palette and drop it into appropriate dropzone/canvas.

# Install #
```shell
npm install --save react-page-maker
```

# How to use #
1. Define the type of UI elements/layouts
2. Create and Register those elements/layouts
3. Utilise these elements/layouts in Palette
4. [Working example](https://github.com/keermanish/example-react-page-maker.git)


### Define the type of UI Elements/Layouts ###
  - Every UI element/layout has mandatory `type` property. It helps to render corresponding component.
    ```Javascript
    // Const.js
    export const elements = {
      TEXTBOX: 'TEXTBOX',
      LAYOUT_GRID_1_2: 'LAYOUT_GRID_1_2'
    };
    ```

### Create and Register those elements/Layouts ###
  - **Create element**

    Elements/Layouts are react component it self but with the feature of drag. To acheive the same we will use `Draggable` component.

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

    This step is similar to creating an element only difference is that, we would be having some dropzones where we can drop the UI Elements.

    ```Javascript
      // DraggableGrid_1_2.js
      import { Draggable, Dropzone } from 'react-page-maker';

      const DragItemGridLayout = (props) => {
        // make sure you are passing `parentID` prop to dropzone
        // it help to mainatain the state to meta data
        const { showBasicContent, id, ...rest } = props;

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
                  <Dropzone parentID={id} id="canvas-1-1" />
                </div>
                <div className="col-sm-6">
                  <Dropzone parentID={id} id="canvas-1-2" />
                </div>
              </div>
            </div>
          </Draggable>
        );
      };
    ```
    **Note** -
      - Provide `id` and `parentID` to every dropzone
      - Parent ID is nothing but an ID of current canvas (which will be available under props). It helps to maintain the nested state.


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
    After this step, application will be aware what type of elements we have and based on those type we can create required fields.
    e.g. from `elements.TEXTBOX` we can create any text field

    **Note** - Call `registerPaletteElements` function before you render palette. e.g. Inside `constructor` or `componentWillMount`

### Utilise these UI Elements/Layouts in Palette ###

  Pass list of elements which we need to show inside palette (not every time we will be using all elements).

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

  **Note** - Make sure every palette element has unique ID and pass the element list to `Palette` component.

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
  | payload | Object      |    Any custom data that you want to pass |
  | initialElements      | Array | Array of element(Object) to be prepopulate inside dropzone, here format will be similar to palette elements |

  **methods**
    - onDrop - To check which element is getting added inside dropzone.
      - params
        - data - Object, Info of element which is going to be add
        - success - A callback function, which helps to decide whether to add element or not. if data is valid then call success function to proceed else skip.
        - syntax -

        ```Javascript
        _onDrop = (data, cb) => {
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

        <Dropzone onDrop={this._onDrop} />
        ```
    - onElementMove - Function get called when we try to move the element from one dropzone to another
      - params
        - elementMoved - Object, Data of element which has been moved
        - success - Callback function, which expect boolean return value
        - syntax -

        ```Javascript
        <Dropzone onElementMove={() => (true)} />
        ```

- **Canvas** (This Component is extended version of Dropzone with some default properties in it)

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | initialElements      | Array | Array of element(Object) to be prepopulate inside canvas(), here format will be similar to palette elements |

  **methods** (Same as methods of Dropzone component)

- **Trash**

  You can use this component to have feature of trash/delete. Once element dropped in Trash it get removed from canvas and state.

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | onBeforeTrash      | function | Callback function, which expect boolean return value |
  | onAfterTrash      | function | Success function which gets triggered once element has been trashed |

  **Syntax**
    ```Javascript
    import { Trash } from 'react-page-maker';

    <Trash onBeforeTrash={() => (true)} onAfterTrash={this._onAfterTrash} />
    ```

## API ##

### State ###

  It provide access to the state object which holds all the meta data.

  - **Syntax**

    ```Javascript
    import { state } from 'react-page-maker';
    ```

    **methods**

    | Name        | Syntax           | Description  |
    | ------------- |:-------------| ----- |
    | getState      | `state.getState();` | Function to get current state of the canvas |
    | clearState      | `state.clearState();` | Function to clear/flush the complete state |
    | addEventListener      | `state.addEventListener(event, (data) => ());` | Function to add events and it has two params(event and cb). **event** - String, name of event. Supported event is `change`. **cb** - Callback function |
    | removeEventListener      | `state.removeEventListener(event, instanceCb);` | Function to add events and it has two params(event and instanceCb). **event** - String, name of event to be removed. **instanceCb** - Instance of event function |



## Thanks ##
Please feel free to raise PR for any new feature or bug (if you find any).

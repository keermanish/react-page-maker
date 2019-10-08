# [React Page Maker](https://www.npmjs.com/package/react-page-maker)
[![npm version](https://badge.fury.io/js/react-page-maker.svg)](https://badge.fury.io/js/react-page-maker)

React-page-maker, A drag-drop featured lib which will help you to build the layout and generate the markup or JSON out of it, This markup or JSON you can store at server side or anywhere based on your requirement and use it later.

Library is designed in such a way that you will get enough flexibility in terms of defining any type of elements/layout which you are going to use throughout the application.

If you are building custom layout builder/dashboard then probably you are in the right place! :)


# Install #
```shell
npm install --save react-page-maker
```

[![Demo](https://img.youtube.com/vi/2yzeqrZA5v0/0.jpg)](https://example-react-page-maker.herokuapp.com/)

# How to use #
1. Define the type of elements
2. Create and Register elements/layouts
3. Render Palette and Canvas
4. [Working example](https://example-react-page-maker.herokuapp.com/) - [Git repo](https://github.com/keermanish/example-react-page-maker.git)


### Define the type of elements ###
  - Every element/layout has mandatory `type` property. Based on type we decide what component to load for that element/layout.
    ```Javascript
    // Const.js
    export const elements = {
      TEXTBOX: 'TEXTBOX',
      LAYOUT_GRID_1_2: 'LAYOUT_GRID_1_2'
    };
    ```

### Create and Register elements/Layouts ###
  - #### Create element ####

    Every Elements should have three versions defined.
    - palette version
    - canvas version
    - preview version

    In palette and canvas version element should have drag feature which can be achieved through `Draggable` component.

    ```Javascript
    // DraggableTextbox.js
    import React from 'react';
    import PropTypes from 'prop-types';
    import { FormGroup, Input, Label } from 'reactstrap';
    import { Draggable } from 'react-page-maker'; // to give drag behaviour

    const DraggableTextbox = (props) => {
      // `showBasicContent` is default prop passed by `Palette` component
      const { showBasicContent, showPreview, name } = props;

      if (showBasicContent) { // palette version - content to be shown in palette list
        return (
          <Draggable {...props}>
            <span>{name}</span>
          </Draggable>
        );
      }

      if (showPreview) { // preview version - content to be shown in preview mode - end result, no need of `Draggable`
        return (
          <FormGroup>
            <Label>{name}</Label>
            <Input type="text" />
          </FormGroup>
        );
      }

      return ( // canvas version - content to be shown in canvas
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

  - #### Create Layout (If you want more complex/nested structure) ####

    Here the steps are very similar to element, after all layouts are also one type of element but the only difference is that they have some dropzone wherein you can drop a elements to form the page structure. To create such dropezon we have `Dropzone` component. Layout can have one or many dropzones but make sure each dropzone has unique identifier.

    ```Javascript
      // DraggableGrid_1_2.js
      import { Draggable, Dropzone } from 'react-page-maker';

      const DragItemGridLayout = (props) => {
        // make sure you are passing `dropzoneProps` prop to dropzone
        const { showBasicContent, showPreview, dropzoneProps, childNode, ...rest } = props;

        if (showBasicContent) { // content to be shown in palette
          return (
            <Draggable {...props} >
              <span>{ rest.name }</span>
            </Draggable>
          );
        }

        if (showPreview) { // content to be shown in preview mode - end result
          return (
            <Row className="row">
              <Col sm="6">
                {childNode['canvas-1-1'] && childNode['canvas-1-1'].map(e => e)}
              </Col>
              <Col sm="6">
                {childNode['canvas-1-2'] && childNode['canvas-1-2'].map(e => e)}
              </Col>
            </Row>
          )
        }

        return ( // content to be shown in canvas
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


  - #### Register Elements ####
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
    After this step, the application will be aware what type of elements we have and based on this types we can create as many fields required.
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

- #### Draggable ####

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | id      | String | ID of an element |
  | name      | String | Name of an element |
  | draggable      | Boolean | Manage element drag behaviour, default is true |
  | type      | String      |   Defines type of an element  |
  | payload | Object      |    Any custom data that you want to pass |

- #### Palette ####

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | paletteElements      | Array | Array of element(Object) to be shown inside palette |

- #### Dropzone ####

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | id      | String | ID of a dropzone |
  | capacity      | Number | Maximum number of elements dropzone can maintain  |
  | allowHorizontal      | Bool | Allow horizontal drop, default is vertical  |
  | initialElements      | Array | Array of element(Object) to be prepopulate inside dropzone, here format will be similar to palette elements |
  | placeholder      | String | Text to be shown when dropzone is emepty. Default value is `Drop Here.` |
  | onDrop      | Function | function gets triggered once element got dropped |
  | onElementMove      | Function | Function get called when we try to move the element from one dropzone to another |


    ```Javascript
    /*
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

    **Note** - If is there any situation where you need to update the dropzone state manually then you can use `dangerouslySetElements` function, this gives you direct access to dropzone state. May be you can refer `state.updateElement|state.removeElement` API if that fulfills your requirement.

    ```Javascript
      onSomeAction = () => {
        // Note - make sure you are passing valid data else state service may break

        // 1 - pass an array if you are just going to reset the dropzone
        const current = this.currentDropzone.current;
        current && current.dangerouslySetElements([element1, element2]);
        // element type should be similar to what you are passing in palette

        // or

        // 2 - pass a function which will give you the current elements that dropzone holds, and then you can make necessary tweaks
        const current = this.currentDropzone.current;
        current && current.dangerouslySetElements((currentElements) => currentElements
          .map(doSomeTweaks));
      }

      <Dropzone
        ref={this.currentDropzone}
        {...requiredProps}
      />
    ```

- #### Canvas ####

  This is a top level dropzone element from where we actually starts drag-drop. `Canvas` is extended version of `Dropzone` with some default properties (e.g. `ID`) defined.

- #### Trash ####

  You can use this component to have feature of trash/delete box. Once element dropped inside Trash then it gets removed from canvas and state.

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | onBeforeTrash      | function | cb which invoke just before element being trashed |
  | onAfterTrash      | function | cb which invoke after element is trashed |

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

- #### Preview ####

  Use this component to show the preview version of current state (End Output or markup). Make sure every draggable elements is returning something on `showPreview`

  **Syntax**
    ```Javascript
    /* how to use */
    <Preview />

    /* OR - for more layout flexibility */
    <Preview>
      {
        ({ children }) => (
          <div>
            Custom Layout
            {children}
          </div>
        )
      }
    </Preview>
    ```

    **Note** - Refer [Create and Register elements/layouts](#create-and-register-elementslayouts) section to know how we define preview version inside draggable element/layout.

## API ##

### State ###

  It provide access to the state object which holds all the meta data.

  | Prop        | Type           | Description  |
  | ------------- |:-------------:| -----|
  | getState      | function | returns current state of canvas |
  | getStorableState      | function | returns current state which can be stored at servers side for future use |
  | clearState      | function | flush current state |
  | getElementParent      | function | returns parent layout element |
  | getElement      | function | returns details of element |
  | removeElement      | function | remove element from tree |
  | updateElement      | function | update specific element |
  | addEventListener      | function | to add event, supported events `change, flush, removeElement, updateElement` |
  | removeEventListener      | function | to remove event, pass proper event cb |

  - **Syntax**

    ```Javascript
    import { state } from 'react-page-maker';

    /* Function to get current state of the canvas */
    state.getState();

    /* Function to get current state of the canvas which can be parsed to string with help of  `JSON.stringfy` and later we can store it at server side */
    state.getStorableState();

    /**
     * function to return parent of element
     * @param {string} dropzoneID - every elements gets dropzoneID under props
     * @param {string} parentID - every elements gets parentID under props
     * @returns {Object} layout element
    */
    state.getElementParent(dropzoneID, parentID);

    /**
     * function to return element details
     * @param {string} elementID - every elements gets id under props
     * @param {string} dropzoneID - every elements gets dropzoneID under props
     * @param {string} parentID - every elements gets parentID under props
     * @returns {Object} element
    */
    state.getElement(elementID, dropzoneID, parentID);

    /**
     * function to remove element from tree
     * @param {string} elementID - every elements gets id under props
     * @param {string} dropzoneID - every elements gets dropzoneID under props
     * @param {string} parentID - every elements gets parentID under props
     * @param {function} cb - success callback function
     * @returns {Boolean}
    */
    state.removeElement(elementID, dropzoneID, parentID, cb);

    /**
     * function to update an element details, you can update name, type, payload properties
     * @param {string} elementID - every elements gets id under props
     * @param {string} dropzoneID - every elements gets dropzoneID under props
     * @param {string} parentID - every elements gets parentID under props
     * @param {Object} newData - value that needs to be set, { name, type, payload }
     * @param {function} cb - success callback function
     * @returns {Boolean}
    */
    state.updateElement(elementID, dropzoneID, parentID, newData, cb);

    /**
    * Function to flush canvas/current state
    * @param {Function} cb - success call back, function gets triggered once canvas is flushed
    */
    state.clearState(() => {
      console.log('Canvas has been flushed successfully')
    });

    /**
    * Function to add event
    * @param {String} event - name of event, supported events are 'change', 'flush',
    * 'removeElement', 'updateElement'
    * @param {Function} cb - function gets called upon event trigger
    * @param {Object} newState - new state
    * @returns {Function} - instance of attached function
    */
    const cb = state.addEventListener('change', (newState) => {
      console.log('new state', newState);
    });

    /**
    * Function to remove event
    * @param {String} event - name of event, supported events are 'change', 'flush','removeElement', 'updateElement'
    * @param {Function} oldEventInstance - instance of previously attached event
    */
    state.removeEventListener('change', cb);
    ```


## Thanks ##
Please feel free to raise PR for any new feature or bug (if you find any).

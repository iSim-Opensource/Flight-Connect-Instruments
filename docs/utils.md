# Utility functions
**Note:** The majority of the positioning functions are just abstractions over normal css attributes for the sake of brevity. None of them are long or complex, so it's worth having a look a their implementations.

## Functions

<dl>
<dt><a href="#utils_constrain">utils_constrain(value, min, max)</a></dt>
<dd><p>Constrain a value to be between min and max</p>
</dd>
<dt><a href="#utils_amountBetween">utils_amountBetween(value, min, max)</a></dt>
<dd><p>The absolute value of the amount of <em>value</em> constrained between max and min.</p>
</dd>
<dt><a href="#utils_rotate">utils_rotate(elem, degrees)</a></dt>
<dd><p>Rotate an element using the CSS transform property</p>
</dd>
<dt><a href="#utils_getElemPos">utils_getElemPos(elem)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the x and y position of an element in pixels from the origin (top left)</p>
</dd>
<dt><a href="#utils_centerElement">utils_centerElement(elem, elementWidth, elementHeight)</a></dt>
<dd><p>Center an element in the middle of the window, given the element's size.</p>
</dd>
<dt><a href="#utils_setElemPos">utils_setElemPos(elem, x, y)</a></dt>
<dd><p>Set the x and y position of an element in pixels from the origin (top left)
Uses CSS &#39;left&#39; and &#39;top&#39; attributes. Element must already have position: &#39;aboslute&#39;</p>
</dd>
<dt><a href="#utils_moveElemBy">utils_moveElemBy(elem, x, y)</a></dt>
<dd><p>Moves an element by the given number of pixels from it&#39;s current position</p>
</dd>
<dt><a href="#utils_setVisible">utils_setVisible(elem, bool)</a></dt>
<dd><p>Sets an element&#39;s css visiblity property to &#39;visible&#39; or &#39;hidden&#39;</p>
</dd>
<dt><a href="#utils_radToDeg">utils_radToDeg(radians)</a> ⇒ <code>Number</code></dt>
<dd><p>Convert radians to degrees</p>
</dd>
<dt><a href="#utils_degToRad">utils_degToRad(degrees)</a> ⇒ <code>Number</code></dt>
<dd><p>Convert degrees to radians</p>
</dd>
<dt><a href="#utils_setText">utils_setText(elem, text)</a></dt>
<dd><p>Sets the innerHTML attribute of the element to the given text
For more information on this see: <a href="https://www.w3schools.com/jsref/prop_html_innerhtml.asp">https://www.w3schools.com/jsref/prop_html_innerhtml.asp</a></p>
</dd>
<dt><a href="#utils_setTextNumeric">utils_setTextNumeric(elem, number, dplaces)</a></dt>
<dd><p>Sets the inner text of an element to a number with a specified number of decimal places</p>
</dd>
<dt><a href="#utils_setTextColour">utils_setTextColour(elem, colour)</a></dt>
<dd><p>Set the colour of an element&#39;s text using the CSS color property 
Can be name of colour like &#39;red&#39; or hex value like &#39;#FF0000&#39;</p>
</dd>
<dt><a href="#utils_loopAudio">utils_loopAudio(audio)</a></dt>
<dd><p>Loop a piece of audio</p>
</dd>
<dt><a href="#utils_stopLooping">utils_stopLooping(audio)</a></dt>
<dd><p>Stop looping the audio element</p>
</dd>
</dl>

<a name="utils_constrain"></a>

## utils\_constrain(value, min, max)
Constrain a value to be between min and max

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Number</code> | Input value |
| min | <code>Number</code> | Returned if input value < min |
| max | <code>Number</code> | Returned if input value > max |

<a name="utils_amountBetween"></a>

## utils\_amountBetween(value, min, max)
The absolute value of the amount of *value* constrained between max and min.

**Kind**: global function  

| Param | Type |
| --- | --- |
| value | <code>Number</code> | 
| min | <code>Number</code> | 
| max | <code>Number</code> | 

**Example**  
```js
utils_amountBetween(75, 50, 100) -> 25
```
<a name="utils_rotate"></a>

## utils\_rotate(elem, degrees)
Rotate an element using the CSS transform property

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element to rotate |
| degrees | <code>Number</code> | Degrees to rotate the element |

<a name="utils_centerElement"></a>

## utils\_centerElement(elem, elementWidth, elementHeight)
Center an element in the middle of the window, given the size you want the element to be.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element to rotate |
| elementWidth | <code>Number</code> | Width of the element |
| elementHeight | <code>Number</code> | Height of the elemnt |


<a name="utils_getElemPos"></a>

## utils\_getElemPos(elem) ⇒ <code>Object</code>
Get the x and y position of an element in pixels from the origin (top left)

**Kind**: global function  

| Param | Type |
| --- | --- |
| elem | <code>Element</code> | 

<a name="utils_setElemPos"></a>

## utils\_setElemPos(elem, x, y)
Set the x and y position of an element in pixels from the origin (top left)
Uses CSS 'left' and 'top' attributes. Element must already have position: 'aboslute'

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element to set the position of |
| x | <code>Number</code> | The X position in pixels to set |
| y | <code>Number</code> | The Y position in pixels to set |

<a name="utils_moveElemBy"></a>

## utils\_moveElemBy(elem, x, y)
Moves an element by the given number of pixels from it's current position. Must have position: absolute or fixed.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element to move |
| x | <code>Number</code> | Pixels to move on X axis |
| y | <code>Number</code> | Pixels to move on Y axis |

<a name="utils_setVisible"></a>

## utils\_setVisible(elem, bool)
Sets an element's css visiblity property to 'visible' or 'hidden'

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element |
| bool | <code>Boolean</code> | Whether or not to make it visible or invisible |

<a name="utils_radToDeg"></a>

## utils\_radToDeg(radians) ⇒ <code>Number</code>
Convert radians to degrees

**Kind**: global function  
**Returns**: <code>Number</code> - degrees  

| Param | Type |
| --- | --- |
| radians | <code>Number</code> | 

<a name="utils_degToRad"></a>

## utils\_degToRad(degrees) ⇒ <code>Number</code>
Convert degrees to radians

**Kind**: global function  
**Returns**: <code>Number</code> - radians  

| Param | Type |
| --- | --- |
| degrees | <code>Number</code> | 

<a name="utils_setText"></a>

## utils\_setText(elem, text)
Sets the innerHTML attribute of the element to the given text
For more information on this see: https://www.w3schools.com/jsref/prop_html_innerhtml.asp

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element |
| text | <code>String</code> | Inner HTML content to set |

<a name="utils_setTextNumeric"></a>

## utils\_setTextNumeric(elem, number, dplaces)
Sets the inner text of an element to a number with a specified number of decimal places

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element |
| number | <code>Number</code> | The number |
| dplaces | <code>Number</code> | The number of decimal places to show |

<a name="utils_setTextColour"></a>

## utils\_setTextColour(elem, colour)
Set the colour of an element's text using the CSS color property 
Can be name of colour like 'red' or hex value like '#FF0000'

**Kind**: global function  

| Param | Type |
| --- | --- |
| elem | <code>Element</code> | 
| colour | <code>String</code> | 

<a name="utils_loopAudio"></a>

## utils\_loopAudio(audio)
Set the loop property on the audio element to true and play it

**Kind**: global function  

| Param | Type |
| --- | --- |
| audio | <code>Audio Element</code> | 

<a name="utils_stopLooping"></a>

## utils\_stopLooping(audio)
Stop looping the audio element

**Kind**: global function  

| Param | Type |
| --- | --- |
| audio | <code>Audio Element</code> | 


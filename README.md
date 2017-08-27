# LiveImage
> 一个动态展示流式图片数据的React Component。支持缩放，编辑，暂停+手动滚动，常用快捷键：  
>`e`: 进入编辑模式  
>`ESC`: 退出编辑模式  
>`s`: 暂停  
>`g`: 播放

## Usage
```
npm i liveimage@git+https://github.com/helm168/liveimage.git

import LiveImage from 'liveimage';
```

## Props
### direction
Type: `Eumn`

`import { DIRECTION } from 'liveimage';`

图片滚动的方向，目前支持三个方向：DIRECTION.LEFT/RIGHT/TOP  

default: `DIRECTION.RIGHT`

### velocity
Type: `number`  

图片每一帧滚动的速度，单位px  

default: `1`

### autoVelocity
Type: `boolean`

是否自动调整速度

default: `true`

### minVelocity
Type: `boolean`

自动调整最小速度

default: `0.5`

### maxVelocity
Type: `boolean`

自动调整最大速度

default: `2`

### imgWidth
Type: `number`  

图片数据(ImageData)的宽度  

default: `2560`

### imgHeight
Type: `number`  

图片数据(ImageData)的高度，由于图片数据是流式的，可以认为是无限的，所以Canvas的高度需要给出一个值，用来分块画  

**这个值不能过大，过大处理数据需要花大量时间，导致fps降低**  

default: `320`

### itemHeight
Type: `number`  

组件本身是一个infinte list，需要知道每个List item的高度做位置计算, 可以不传，如果不传，使用`imgHeight/imgWidth * 组件width`来计算。

**对于图片数据，为了保持比例，最好不传**  

default: `undefined`

### imgs
Type: `array`  

图片数据数组，每个item可以是字节数组，也可以是图片URL。对于自己数组：格式为
```
{
  imageBuffer: [],
  imageHeight,
  imageWidth,
}
```

### scaleStep
Type: `number`  

组件支持缩放，scaleStep为每次缩放时的增量  

default: `0.5`

### maxCacheData
Type: `number`  

由于组件高度是无限的，渲染数据也需要定期清除，防止内存过多  

default: `1000`

### webgl
Type: `number`

是否采用webgl渲染  

default: `true`

### store
Type: `object`

`import { Store } from 'liveimage';`

图片数据管理对象, 关于store的用法参考这里

### blockscope
Type: `array`

加减速范围，待渲染图片的长度处于此范围之外时会触发自动加减速

default: `[200, 300]`

### showControls
Type: `boolean`  

是否显示控制按钮以及添加控制快捷键

default: `true`

### onMeasure(box)
Type: `function`

`box: {left, top, width, height, id}`  
编辑回调函数，用来通过外部组件当前的编辑矩形

## Method
### scrollTo(position)
`position: {x: 0, y: 0}`
滚动到某个位置

### getPosition()
`position: {x: 0, y: 0}`  
当前滚动的位置

### scrollTo(position)
`position: {x: 0, y: 0}`  
滚动到某个位置

### enterEditMode()
进入编辑模式

### exitEditMode()
退出编辑模式


## Store
### constructor(options)
```
options: {maxLn, data}
maxLn: 同maxCacheData
fMaxLn: 强制清除缓存的最大值，不管数据有没有使用过
data：同imgs
```

### addImageData(data)
`data: 同imgs`  
添加图片数据

### addMeasureBox(measureBox)
`measureBox: {left, top, width, height, id}`  
添加测量矩形，该方法是`实时`的，left/top是相对于当时的屏幕坐标来计算的，后续会随着图片滚动  
id: `required`，矩形的唯一id，通过id来进行唯一性判断

### setMeasureBoxs(measureBoxs)
`measureBoxs: [measureBox]`  
设置测量矩形数组，使用该方法可以一次性设置多个测量矩形以及清除已经设置的矩形

### getMeasureBoxs()
取得当前设置的矩形数组

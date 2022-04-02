# OpenLayers2 extension - Ring Maps

RingMap은 시계열 데이터를 시각화하는 하나의 방법으로 OpenLayers2 기반(이하 OL2)에서 Ring Map을 생성할 수 있는 라이브러리입니다.

OL2의 {OpenLayers.Layer.Vector}를 상속받아 Layer 형식의 완성체 클래스로 만들었으며 기존의 레이어와 동일한 방법으로 레이어를 Map Object에 추가할 수 있습니다.
CLASS_NAME을 "OpenLayers.Layer.CreateRingMap"로 명명하였습니다.

벡터 데이터의 필드값의 단계 구분을 위해 [geostats](https://github.com/simogeo/geostats)를 사용하였습니다. Classify 함수로 Equal Interval, Quantile, Natural Breaks 등 여러가지가 있지만 Equal Interval만 사용하고 있습니다. 같은 데이터로 QGIS와 값을 비교를 해보니 Equal Interval만 동일하였습니다.


* 필수 프로퍼티
  * sourceLayer : 시계열 데이터를 가진 원본 레이어 - {OpenLayers.Layer.Vector}
  * fieldNames : 원본 레이어의 시계열 필드명 - {Array}
* 선택 프로퍼티
  * labelDisplay : 공통 라벨설정 (default false) - {Boolean}
  * labelField : 라벨을 설정할 필드명 - {String}
  * valueDisplay : 셀에 값 표시 유무 (default false) - {Boolean}
  * anchorDisplay : 원본 데이터와 첫번째 셀간의 연결선 생성   (default false) - {Boolean}
  * colors : 색상설정 {Array}


```javascript
var map = new OpenLayers.Map('map', { ... });
var sourceLayer = new OpenLayers.Vector.Layer('layer name', ... );

var ringLayer = new OpenLayers.Layer.CreateRingMap('RingMap Layer', //layer name {String}
  sourceLayer, //reference vector layer {OpenLayers.Layer.Vector}
  fieldNames,  //sourceLayer numeric fields {Array}
  {
    labelDisplay: false, //common label (default false) {Boolean}
    labelField: 'sgg_nm', //label field {String}
    valueDisplay: false, //display cell value (default false) {Boolean}
    anchorDisplay: true,  //display anchor (default false) {Boolean}
    colors: ['#8ec1dd', '#5aa2cf', '#3181bd'] //classify colors {Array}
  }
);

map.addLayer(ringLayer);
```

# License
Open Source JavaScript, released under the 2-clause BSD License (also known as the FreeBSD).

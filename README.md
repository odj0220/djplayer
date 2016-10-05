# Dj Player

Media 파일을 HTML 상에서 재생하는 플레이어 입니다.

## Installation

```
bower install djplayer --save
```

### djPlayer.init()

djPlayer를 HTML 상에 나타냅니다.

```js
djPlayer.init();
```

### djPlayer.add(url, title, artist, type, code)

djPlayer 목록에 미디어를 추가합니다.
* 'url' 미디어를 실행 시킬수 있는 url 주소
* 'title' 미디어 파일의 제목
* 'artist' 미디어 파일의 아티스트, 비디오 파일시 ''
* 'type' 오디오 파일은 0, 비디오 파일은 1
* 'code' 구분이 가능한 파일코드(이후 이미지를 변경하거나 할때 필요)

```js
djPlayer.add('http://localhost/testVideo', '테스트 비디오', '', 1, 1);
```

### djPlayer.listing()

djPlayer 의 목록을 표시할때 사용합니다. (목록을 추가했는데 나타나지 않거나 변경 내용이 적용되지 않을때 사용)

```js
djPlayer.listing();
```

### djPlayer.cover

audio 파일일때 cover 사진을 사용자 임의대로 변경할 수 있습니다. function  형태로 code, element 변수를 넘겨줍니다.

```js
djPlayer.cover = function(code, elem){
    $.ajax({
        url: 'http://localhost/tag?code='+code,
        data: {
            format: 'json'
        },
        error: function(err) {
            console.log(err)
        },
        dataType: 'jsonp',
        success: function(data) {
            elem.src = data.picture;
        },
        type: 'GET'
    });
}
```
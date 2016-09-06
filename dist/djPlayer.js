(function() { function _djPlayer() {
        'use strict';

        var djPlayer = {
            version: '0.1.0'
        };

        djPlayer.config = {
            repeat: 0, // 0: 반복없음, 1: 한곡반복, 2: 전체반복
            shuffle: 0,  // 0: 순차재생, 1: 랜덤재생
            volume: 5, // 0~10
            now: 0
        };

        djPlayer.init = function(){
            if(document.getElementById('dj_player_wrap')){
                document.body.removeChild(document.getElementById('dj_player_wrap'));
            }
            var str = '<div id="dj_player_wrap"><div class="topBar"><div class="play_title col-md-9 col-sm-9 col-xs-9"><span></span></div><div class="col-md-3 col-sm-3 col-xs-3"><div class="btn" id="dj_player_resize"><span class="glyphicon glyphicon-resize-small"></span></div><div class="btn" id="dj_player_close"><span class="glyphicon glyphicon-remove"></span></div></div></div><div id="dj_player_screen"><img id="dj_player_cover" src border="10"><video id="dj_player_video" src autoplay="" data-setup="{}"></video><div id="dj_player_controls"><div><div class="col-md-7 col-sm-7 col-xs-7" id="dj_player_time"><div class="dj_player_progress"><div class="dj_player_buffer"></div><div class="dj_player_bar"></div></div></div><div class="col-md-5 col-sm-5 col-xs-5 txar" id="dj_player_volume"><div class="btn btn-default btn-circle" id="dpc_mute"><span class="glyphicon glyphicon-volume-up"></span></div><!--<div><input type="range" id="dpc_volume" min="0" max="1" step="0.1" value="1"></div>--><div class="dj_player_progress"><div class="dj_player_bar"></div></div></div></div><div><div class="col-md-8 col-sm-8 col-xs-8 pr0"><div class="btn btn-default btn-circle" id="dpc_prev"><span class="glyphicon glyphicon-step-backward"></span></div><div class="btn btn-default btn-circle" id="dpc_pause"><span class="glyphicon glyphicon-play"></span></div><div class="btn btn-default btn-circle" id="dpc_next"><span class="glyphicon glyphicon-step-forward"></span></div><span id="dj_player_running">00:00 - 00:00</span></div><div class="col-md-4 col-sm-4 col-xs-4 txar pl0"><div class="btn btn-default btn-circle" id="dpc_repeat"><span class="glyphicon glyphicon-repeat">A</span></div><div class="btn btn-default btn-circle" id="dpc_shuffle"><span class="glyphicon glyphicon-random"></span></div><div class="btn btn-default btn-circle" id="dpc_full_screen"><span class="glyphicon glyphicon-fullscreen"></span></div></div></div></div></div><div class="playList"><ul id="dj_player_list"></ul></div></div>';
            $('body').append(str);
            playerInit();
        };

        djPlayer.list = [];
        djPlayer._list = [];

        djPlayer.reset = function(){
            djPlayer.list = [];
            djPlayer._list = [];
        };

        djPlayer.add = function(url, title, artist, type, code){
            if(!document.getElementById('dj_player_wrap')) djPlayer.init();

            // type 0: audio, 1: video
            var data = {url: url, title: title, artist: artist, type: type, code:code};
            if(findKey(djPlayer.list, {url: url})){
                alert("이미 추가된 목록 입니다.")
            }else{
                // 리스트추가
                djPlayer.list.push(data);
                djPlayer.listing();
                // 실재 재생목록에 추가
                djPlayer.shuffle(djPlayer.config.shuffle);
            }
        };

        djPlayer.shuffle = function(option){
            djPlayer.config.shuffle = option;
            if(option){
                djPlayer._list = clone(djPlayer.list);
                shuffle(djPlayer._list);
            }else{
                djPlayer._list = djPlayer.list;
            }
        };

        djPlayer.listing = function(){
            $("#dj_player_list").empty();
            var str = '';
            djPlayer.list.forEach(function(v,i){
                str += '<li><a href="#" id="dj_idx_'+i+'" onclick="djPlayer.play(\''+v.url+'\', '+v.type+', \''+(v.code || 'null')+'\')">'+(!v.type?(v.title+' - '+v.artist):v.title)+'</a></li>';
            });
            $("#dj_player_list").append(str);
        };

        djPlayer.play = function(url, type, code){
            var cover = $("#dj_player_cover");
            var player = $("#dj_player_video");
            var controls = $("#dj_player_controls");
            var selectObj;
            if(!url) selectObj = djPlayer.list[0];
            else selectObj = findKey(djPlayer.list, {'url': url});

            if(!selectObj.type){
                cover.css('display', 'block');
                cover.attr('src', djPlayer.cover(selectObj.code, document.getElementById('dj_player_cover')));
            }
            else cover.css('display', 'none');
            player.attr('src', selectObj.url);

            // 현재 재생하는 목록을 등록
            djPlayer.config.now = djPlayer._list.indexOf(selectObj);

            // 버퍼시작
            setTimeout(function(){
                startBuffer()
            },500);

            // class명 바뀌기전 애니메이션 정지
            stStop();
            // 재생 목록 active 하기
            //if(document.getElementsByClassName('dj_player_select').length)document.getElementsByClassName('dj_player_select')[0].className = "";
            $(".dj_player_select").removeClass("dj_player_select");
            var playIdx = djPlayer.list.indexOf(selectObj);
            document.getElementById('dj_idx_'+playIdx).className = "dj_player_select";
            
            // 헤더에 텍스트 입력
            $('.play_title > span').addClass("dj_player_select");
            $('.play_title > span').html(!selectObj.type?(selectObj.title+' - '+selectObj.artist):selectObj.title);
            //슬라이드 텍스트 재생
            stStart();
            
            // 동영상일때 컨트롤러 숨기기
            if(type){
                setTimeout(function(){
                    controls.fadeOut("slow");
                },1000)
            }
        };

        djPlayer.cover = function(code, cover){
            return 'http://www.djcloud.co.kr/images/layout/topLogo.png';
        };

        djPlayer.prev = function(){
            // 목록이 있을때만
            if(djPlayer.list.length){
                if(djPlayer.config.now < 1){
                    var music = djPlayer._list[+djPlayer._list.length - 1];
                    djPlayer.play(music.url, music.type, music.code);
                }else{
                    var music = djPlayer._list[+djPlayer.config.now - 1];
                    djPlayer.play(music.url, music.type, music.code);
                }
            }
        };

        djPlayer.next = function(end){
            // 재생목록이 끝난뒤
            if(end){
                // 반복 없을때
                if(!djPlayer.config.repeat){
                    // 마지막 곡이 아닐때
                    if(djPlayer._list.length > +djPlayer.config.now + 1){
                        var music = djPlayer._list[+djPlayer.config.now + 1];
                        djPlayer.play(music.url, music.type, music.code);
                    }else{
                        djPlayer.shuffle(djPlayer.config.shuffle);
                    }
                }
                // 한곡 반복일때
                else if(djPlayer.config.repeat.toString() === '1'){
                    var music = djPlayer._list[djPlayer.config.now];
                    djPlayer.play(music.url, music.type, music.code);
                }
                // 전채 반복일때
                else{
                    // 마지막 곡이거나 혹은 그 이상일때
                    if(djPlayer._list.length <= +djPlayer.config.now + 1){
                        djPlayer.shuffle(djPlayer.config.shuffle);
                        var music = djPlayer._list[0];
                        djPlayer.play(music.url, music.type, music.code);
                    }else{
                        var music = djPlayer._list[+djPlayer.config.now + 1];
                        djPlayer.play(music.url, music.type, music.code);
                    }
                }
            }
            // 임의로 넘겼을때
            else{
                // 마지막 곡이거나 혹은 그 이상일때
                if(djPlayer._list.length <= +djPlayer.config.now + 1){
                    djPlayer.shuffle(djPlayer.config.shuffle);
                    var music = djPlayer._list[0];
                    djPlayer.play(music.url, music.type, music.code);
                }else{
                    var music = djPlayer._list[+djPlayer.config.now + 1];
                    djPlayer.play(music.url, music.type, music.code);
                }
            }
        };

        djPlayer.close = function(){
            djPlayer.reset();
            document.body.removeChild(document.getElementById('dj_player_wrap'));
        };

        function playerInit(){
            var video = document.getElementById("dj_player_video");
            var screen = $("#dj_player_screen");
            var controls = $("#dj_player_controls");
            
            // 재생이 마지막으로 끝났을때
            video.onended = function(){
                djPlayer.next(true);
            }

            
            // 마우스 오버시
            var mouseTimeout;
            screen.mousemove(function(){
                controls.fadeIn();
                clearTimeout(mouseTimeout);
                mouseTimeout = setTimeout(function(){
                    if(djPlayer._list.length && djPlayer._list[djPlayer.config.now].type) {
                        controls.fadeOut("slow")
                    }
                }, 1500);
            });
            // 마우스아웃
            screen.mouseleave(function(){
                if(djPlayer._list.length && djPlayer._list[djPlayer.config.now].type) {
                    setTimeout(function(){
                        controls.fadeOut("slow");
                    },1000)
                }
            });


            /*컨트롤러 설정*/
            // Buttons
            var playButton = document.getElementById("dpc_pause");
            var prevButton = document.getElementById("dpc_prev");
            var nextButton = document.getElementById("dpc_next");
            var muteButton = document.getElementById("dpc_mute");
            var fullScreenButton = document.getElementById("dpc_full_screen");
            var volumeBar = document.getElementById("dpc_volume");
            var repeatButton = document.getElementById("dpc_repeat");
            var shuffleButton = document.getElementById("dpc_shuffle");
            var runningTxt = document.getElementById("dj_player_running");
            var resizeButton = document.getElementById("dj_player_resize");
            var closeButton = document.getElementById("dj_player_close");



            //버튼 초기화
            changeButtonRepeat();
            changeButtonShuffle();

            // 볼륨 초기화
            $('#dj_player_volume .dj_player_bar').css('width', (video.volume*100)+'%');

            /*닫기버튼*/
            closeButton.addEventListener("click", function() {
                djPlayer.close();
            });

            /*재생버튼*/
            playButton.addEventListener("click", function() {
                if(!video.getAttribute('src')) djPlayer.play();
                else{
                    if (video.paused == true) {
                        video.play();
                        playButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-pause";
                    } else {
                        video.pause();
                        playButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-play";
                    }
                }
            });

            /*리사이즈 버튼*/
            resizeButton.addEventListener("click", function() {
                if($(".dj_player_pop").length){
                    document.getElementById("dj_player_wrap").className = "";
                    resizeButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-resize-small";
                    if($(window).width() < 480){
                        $("#dj_player_wrap").css({'top': 0, 'left': 0});
                    }
                }else{
                    document.getElementById("dj_player_wrap").className = "dj_player_pop";
                    resizeButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-resize-full";
                }
            });

            /*이전버튼*/
            prevButton.addEventListener("click", function() {djPlayer.prev();});

            /*다음버튼*/
            nextButton.addEventListener("click", function() {djPlayer.next();});

            /*음소거 버튼*/
            muteButton.addEventListener("click", function() {
                if (video.muted == false) {
                    video.muted = true;
                    muteButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-volume-off";
                } else {
                    video.muted = false;
                    muteButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-volume-up";
                }
            });

            /*풀스크린*/
            fullScreenButton.addEventListener("click", function() {
                if (video.requestFullscreen) {
                    if(document.requestFullscreen) document.exitFullscreen();
                    else document.getElementById("dj_player_screen").requestFullscreen();
                } else if(video.msRequestFullscreen){
                    if(document.msFullscreenElement)document.msExitFullscreen();
                    else document.getElementById("dj_player_screen").msRequestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    if(document.mozFullScreen) document.mozCancelFullscreen();
                    else document.getElementById("dj_player_screen").mozRequestFullScreen();
                } else if (video.webkitRequestFullscreen) {
                    if(document.webkitIsFullScreen) document.webkitExitFullscreen();
                    else document.getElementById("dj_player_screen").webkitRequestFullscreen();
                }
                screen.css('height', '100%');
            });
            /*풀스크린 해지시*/
            // Webkit
            document.addEventListener("webkitfullscreenchange", function(){
                if(!document.webkitIsFullScreen){
                    screen.css('height', '250px');
                    fullScreenButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-fullscreen";
                }else{
                    fullScreenButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-resize-small";
                }
            });
            // Firefox
            document.addEventListener("mozfullscreenchange", function(){
                if(!document.mozIsFullScreen){
                    screen.css('height', '250px');
                    fullScreenButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-fullscreen";
                }else{
                    fullScreenButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-resize-small";
                }
            });
            // Explorer
            document.addEventListener("MSFullscreenChange", function(){
                if(!document.msFullscreenElement){
                    screen.css('height', '250px');
                    fullScreenButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-fullscreen";
                }else{
                    fullScreenButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-resize-small";
                }
            });


            /*반복버튼*/
            repeatButton.addEventListener("click", function() {
                if (djPlayer.config.repeat.toString() === '1') {
                    djPlayer.config.repeat = 2;
                } else if (djPlayer.config.repeat.toString() === '2') {
                    djPlayer.config.repeat = 0;
                } else{
                    djPlayer.config.repeat = 1;
                }
                changeButtonRepeat();
            });

            /*재생순서버튼*/
            shuffleButton.addEventListener("click", function() {
                if (djPlayer.config.shuffle) {
                    djPlayer.config.shuffle = 0;
                } else{
                    djPlayer.config.shuffle = 1;
                }
                changeButtonShuffle();
            });

            /*재생바 실시간 이동*/
            video.addEventListener("timeupdate", function() {
                if (video.paused == true) {playButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-play";}
                else {playButton.getElementsByTagName('span')[0].className = "glyphicon glyphicon-pause";}
                var currentPos = video.currentTime; //Get currenttime
                var maxduration = video.duration; //Get video duration
                var percentage = 100 * currentPos / maxduration; //in %
                // 재생바 이동
                $('#dj_player_time .dj_player_bar').css('width', percentage+'%');
                // 재생시간 표시
                if(video.duration)runningTxt.innerHTML = formatTime(video.currentTime)+" - "+formatTime(video.duration);
            });

            var timeDrag = false;   /* Drag status */
            $('#dj_player_time .dj_player_progress').mousedown(function(e) {timeDrag = true;updatebar(e.pageX);});
            $('#dj_player_time').mouseup(function(e) {if(timeDrag) {timeDrag = false;updatebar(e.pageX);}});
            $('#dj_player_time').mousemove(function(e) {if(timeDrag) {updatebar(e.pageX);}});

            // 재생바 실시간 이동
            var updatebar = function(x) {
                var progress = $('#dj_player_time .dj_player_progress');
                var maxduration = video.duration; //Video duraiton
                var position = x - progress.offset().left; //Click pos
                var percentage = 100 * position / progress.width();
                //Check within range
                if(percentage > 100) {
                    percentage = 100;
                }
                if(percentage < 0) {
                    percentage = 0;
                }
                //Update progress bar and video currenttime
                $('#dj_player_time .dj_player_bar').css('width', percentage+'%');
                video.currentTime = maxduration * percentage / 100;
            };

            /*볼륨 컨트롤*/
            var volumeDrag = false;   /* Drag status */
            $('#dj_player_volume .dj_player_progress').mousedown(function(e) {volumeDrag = true;updateVolume(e.pageX);});
            $('#dj_player_volume').mouseup(function(e) {if(volumeDrag) {volumeDrag = false;updateVolume(e.pageX);}});
            $('#dj_player_volume').mousemove(function(e) {if(volumeDrag) {updateVolume(e.pageX);}});

            var updateVolume = function(x) {
                var progress = $('#dj_player_volume .dj_player_progress');
                var position = x - progress.offset().left; //Click pos
                var percentage = 100 * position / progress.width();
                //Check within range
                if(percentage > 100) {percentage = 100;}
                if(percentage < 0) {percentage = 0;}
                //Update progress bar and video currenttime
                $('#dj_player_volume .dj_player_bar').css('width', percentage+'%');
                video.volume = percentage/100;
            };

            video.addEventListener("volumechange", function () {
                $('#dj_player_volume .dj_player_bar').css('width', (video.volume*100)+'%');
            });

            // 드래그
            $("#dj_player_wrap").draggable({
                handle: ".play_title"
            });
        }

        // 오브젝트 검색
        function findKey (array, option){
            var rtn;
            if(typeof option === 'function'){
                array.forEach(function(v,i){
                    rtn = option(v);
                });
            }else if(typeof option === 'object'){
                var keys = Object.keys(option);
                var Break = new Error('Break');
                var check;
                try {
                    array.forEach(function(v,i){
                        check = false;
                        keys.forEach(function(j,k){
                            if((k<1 || (k > 0 && check)) && v[j].toString() === option[j].toString()) check = true;
                            else check = false;
                        });
                        if(check){
                            rtn = v;
                            throw Break;
                        }
                    });
                } catch (e) {
                    if (e!= Break) throw Break;
                }
            }
            return rtn;
        }
        
        // 버퍼 시작
        function startBuffer() {
            var video = document.getElementById("dj_player_video");
            if(video){
                var maxduration = video.duration;
                var currentBuffer = 0;
                if(video.buffered.length){
                    currentBuffer = video.buffered.end(0);
                    var percentage = 100 * currentBuffer / maxduration;
                    if(percentage > 100) percentage = 100;
                    if(percentage < 0) percentage = 0;
                    $('.dj_player_buffer').css('width', percentage+'%');
                }
                if(currentBuffer < maxduration || !maxduration) {
                    setTimeout(function(){
                        startBuffer()
                    }, 500);
                }
            }
        };

        // 반복옵션에 따른 버튼 변경
        function changeButtonRepeat(){
            var  repeatBtn = document.getElementById('dpc_repeat').getElementsByTagName('span')[0];
            if(djPlayer.config.repeat.toString() === '1'){
                repeatBtn.innerHTML  = '1';
                repeatBtn.style.color = 'skyblue';
            }else if(djPlayer.config.repeat.toString() === '2'){
                repeatBtn.innerHTML  = 'A';
                repeatBtn.style.color = 'skyblue';
            }else{
                repeatBtn.innerHTML  = '';
                repeatBtn.style.color = '#000';
            }
        }
        // 재생옵션에 따른 버튼 변경
        function changeButtonShuffle(){
            var  repeatBtn = document.getElementById('dpc_shuffle').getElementsByTagName('span')[0];
            if(djPlayer.config.shuffle){
                repeatBtn.style.color = 'skyblue';
            }else{
                repeatBtn.style.color = '#000';
            }
        }
        
        // 배열을 섞는 함수
        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }

        function formatTime(seconds) {
            var sec_num = parseInt(seconds, 10); // don't forget the second param
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            if(hours < 1) return minutes+':'+seconds;
            else return hours+':'+minutes+':'+seconds;
        }

        // 복사
        function clone(obj) {
            if (obj === null || typeof(obj) !== 'object')
                return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = obj[attr];
                }
            }
            return copy;
        }

        // text slide start
        function stStart(){
            $(".dj_player_select").each(function(i,v) {
                slideText(v);
            });

            function slideText(elem){
                if($(elem).width() > $(elem).parent().width()){
                    var lw = $(elem).width() - $(elem).parent().width() + 20;
                    $(elem).animate({'margin-left': '-'+lw+'px'},{
                        duration: 4000,
                        complete: function(){
                            $(this).stop();
                            $(this).css({'margin-left': '0'});
                            setTimeout(function(){
                                slideText(elem);
                            }, 500);
                        }
                    });
                }
            }
        }
        // text slide stop
        function stStop(){
            $(".dj_player_select").css('margin-left', '0');
            $(".dj_player_select").animate().stop();
        }


        return djPlayer;}
        if (typeof define === "function" && define.amd) define(_FF);
        else if (typeof module === "object" && module.exports) module.exports = _FF();
        else this.djPlayer = _djPlayer();
    }
)()

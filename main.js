
/* 
==============================
 feed 정보
*/
let feedData = [];

fetch('data/feed.json')
  .then(res => res.json())
  .then(data => {
    feedData = data;
    renderFeed(); // ← 피드 렌더링 시작!
  })
  .catch(err => console.error('피드 로드 실패:', err));
  //==========================


/* 
==============================
 채팅 정보
*/

let chatData = [];      // 전체 채팅 데이터
let currentChatRoom = null; // 현재 열려 있는 채팅방 id
const shownDialogues = new Set(); // ✅ F5 누르면 항상 비어있는 상태로 시작
  
// ✅ 채팅 데이터 로딩 및 목록 출력
fetch('data/chat.json')
.then(res => res.json())
.then(data => {
  chatData = data.map(room => ({ ...room, completed: false })); // 초기 상태 설정
  renderChatList();
});

//=============================

/* 
==============================
🎬 인트로 시퀀스 제어
*/

// 인트로에서 순서대로 보여줄 텍스트 배열
// → 원하는 문장만 수정하면 간단히 변경 가능
const introLines = [
  "안녕! 나는 어두운 도시의 한줄기 빛...",
  "... 이라고 하면 멋있어 보이지?",
  "괴담 해결사, 루시아야!",
  "이 도시, 평범한 날이 하루도 없거든?",
  "오늘은 어떤 사건들이 나를 기다릴까?",

];

let currentLine = 0; // 현재 출력 중인 문장의 인덱스
let charIndex = 0;         // 현재 문장에서 출력한 글자 수
let typingSpeed = 50;      // 타이핑 속도 (ms)
let isTyping = false;      // 타이핑 중인지 여부

// 인트로 텍스트, vidio 표시될 HTML 요소를 가져옴
const introTextElement = document.getElementById("intro-text");
const introVideo = document.getElementById("intro-video");

/* 
==============================
*/


/* 
==============================
🎬 오디오 제어
*/

// 🎵 배경음악 오디오 객체 생성 (전역)
// 🔁 중복 재생 방지를 위해 한 번만 생성하고 재사용
let bgmAudio = null;   //new Audio('assets/sound/lobby.mp3'); // ← 여기서 경로 설정
let isBgmPlaying = false; // 재생여부 확인

//bgmAudio.loop = true;
//bgmAudio.volume = 0;

const bgmTracks = {
  lobby1: 'assets/sound/lobby1.mp3',
  lobby2: 'assets/sound/lobby2.mp3',
  lobby3: 'assets/sound/lobby3.mp3'
};


//==============================


/*
==============================
💬 다이얼로그 시스템 정보보
==============================
*/

/**
 * 🎞️ 대사 데이터
 * - 캐릭터 이름, 위치(왼/오), 대사 내용, 이미지 경로 포함
 * - 이 배열의 순서대로 대화가 진행됨
 */
const dialogues = [

];


let currentDialogueSet = []; // 현재 대사 목록
let currentDialogueIndex = 0;// 현재 대화 인덱스 저장용
let dialogueEndCallback = null; // 대사 끝난 후 실행할 함수
/* 
==============================
*/



/* 
==============================
 단서 정보
*/
const clues = [
  { id: 'footprint', title: '수상한 발자국', description: '밤에 발견된 젖은 발자국… 누군가 급히 떠난 듯하다.', image: 'assets/clues/c1.jpg', collected: false },
  { id: 'photo', title: '흔들린 사진', description: '벤치에서 찍힌 흐릿한 인물 사진. 옆엔…', image: 'assets/clues/c2.jpg', collected: false },
  // 필요만큼 추가
];

/* 
==============================
*/


/* 
==============================
 엔딩 정보보
*/
const endings = [
  { id: 'ending1', title: '진실의 문을 열다', description: '루시안은 유령의 진실을 밝혀냈다...', condition: { cluesCollected: ['footprint','photo'], choicePath: [1,2] } },
  { id: 'ending2', title: '어둠 속에 묻히다', description: '단서가 부족했고, 진실은 잊혀졌다...', condition: { cluesCollected: [], choicePath: [2] } },
  
];
/* 
==============================
*/





/* 
====================================================================================================================
✅✅✅ 메인 함수 정의 구간간
*/

/**
 * 메인 UI로 전환하는 함수
 */
function enterMainUI() {
  document.getElementById("intro-screen").classList.add("hidden"); // 인트로 영역을 숨기고
//  startIntroDialogue(); //다이아 로그 출력 
//  document.getElementById("main-ui").classList.remove("hidden"); //스마트폰 UI를 표시
  
  playBGM(); //배경 음악 재생

  loadDialogueSet("intro", () => {
    document.getElementById("main-ui").classList.remove("hidden");
  }, false);
}


/**
 * 한 줄씩 텍스트를 순서대로 출력하는 함수
 * - 일정 간격(2.5초)으로 다음 문장을 자동으로 표시함
 * - 모든 문장을 다 출력하면 자동으로 메인 UI로 전환
 */
function showIntroText() {
  if (currentLine < introLines.length) {
    // 현재 문장을 표시
    introTextElement.textContent = introLines[currentLine];
    currentLine++;

    // 다음 문장을 2.5초 후에 표시
    setTimeout(showIntroText, 2500);
  } else {
    // 모든 문장이 끝났으면 자동으로 메인 화면으로 이동   enterMainUI();

     // 모든 문장이 끝났더라도, 영상이 끝나기 전이면 대기
     const checkVideoEnd = setInterval(() => {
      if (introVideo.ended) {
        clearInterval(checkVideoEnd);
        document.getElementById("intro-screen").classList.add("fade-out");
        setTimeout(() => {
          //startIntroDialogue(); //다이아 로그 출력 
          enterMainUI(); //메인 화면 이동
        }, 1000);
      }
    }, 500); // 0.5초마다 영상 종료 여부 확인
  }
}


/**
 * Skip 버튼 클릭 시 실행되는 함수
 * - 인트로를 즉시 건너뛰고 메인 UI로 전환
 */
function skipIntro() {
  document.getElementById("intro-screen").classList.add("fade-out");
  setTimeout(() => {
   enterMainUI();
  }, 1000);
}
// 🎬 영상이 끝나면 페이드 아웃 후 메인 UI 진입
introVideo.addEventListener('ended', () => {
  document.getElementById("intro-screen").classList.add("fade-out");
  setTimeout(() => {
    enterMainUI();
  }, 1000);
});


/*
 * 🎵 배경음악 재생 (볼륨 페이드인 + 중복 방지)
 * - 여기서는 전역에서 만든 `bgmAudio`를 재활용해서 한 번만 재생되도록 함
 * - 동시에 볼륨을 0에서 시작해서 0.3까지 천천히 올려줌 (페이드 인)
 */
function playBGM() {
  // 배경음악이 멈춰있을 때만 재생 (중복 방지)
  if (!isBgmPlaying) {
    // 최초 재생이므로 bgmAudio 객체 생성 및 설정
    bgmAudio = new Audio(bgmTracks.lobby1);  // ← 기본 음악 경로 설정
    bgmAudio.loop = true;
    bgmAudio.volume = 0;
    bgmAudio.play();

    isBgmPlaying = true;


  // 볼륨 제어. 0 애서 3까지 서서히올라가도록 페이드 처리  
    let volume = 0; // 초기 볼륨
    const fadeIn = setInterval(() => {
      volume += 0.03; // 조금씩 볼륨 증가
      if (volume >= 0.3) {
        volume = 0.3; // 최대 볼륨 제한
        clearInterval(fadeIn); // 더 이상 증가하지 않도록 멈춤
      }
      bgmAudio.volume = volume; // 현재 볼륨 적용
    }, 100); // 0.1초마다 실행
  }
}


/**
  *음악 중지 합수
 */
function stopBGM() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    isBgmPlaying = false;
}
}

/**
 * 🎶 배경음악 변경 함수
 * @param {string} path - 새로운 음악 파일 경로 (예: 'assets/sound/night.mp3')
 */

function changeBGM(path) {
  // 🎧 현재 음악이 재생 중이면 페이드 아웃
  if (bgmAudio && isBgmPlaying) {
    let volume = bgmAudio.volume;
    const fadeOut = setInterval(() => {
      volume -= 0.03;
      if (volume <= 0) {
        clearInterval(fadeOut);
        bgmAudio.pause();
        bgmAudio = null;
        isBgmPlaying = false;

        // 🎵 새로운 음악으로 전환
        playNewBGM(path);
      } else {
        bgmAudio.volume = volume;
      }
    }, 100);
  } else {
    // 🎵 바로 새 음악 재생
    playNewBGM(path);
  }
}

/**
 * 새로운 음악 재생 함수 (페이드 인 효과 포함)
 */
function playNewBGM(path) {
  bgmAudio = new Audio(path);
  bgmAudio.loop = true;
  bgmAudio.volume = 0;
  bgmAudio.play();
  isBgmPlaying = true;

  // 페이드 인
  let volume = 0;
  const fadeIn = setInterval(() => {
    volume += 0.03;
    if (volume >= 0.3) {
      volume = 0.3;
      clearInterval(fadeIn);
    }
    bgmAudio.volume = volume;
  }, 100);
}

/*
 * 효과음 재생 함수
 */
function playClickSound() {
  const audio = new Audio('assets/sound/click.mp3');
  audio.volume = 0.3;
  audio.play();
}

/* 
==============================
📱 스마트폰 내부 UI 제어
==============================
*/

/**
 * 스마트폰의 탭 전환 함수
 * - feed, chat, report 중 하나만 보이도록 제어
 * - 선택된 탭 버튼의 색상을 강조함
 * @param {string} tab - 보여줄 탭의 ID ("feed", "chat", "report", "clues")
 */
function switchTab(tab) {
  // 모든 탭 내용을 숨기
  document.querySelectorAll('.feed, .chat, .report, .clues, .board').forEach(el => {
    el.classList.remove('active');



  });

  // 선택된 탭만 표시
  document.getElementById(tab).classList.add('active');

  // 모든 탭 버튼 비활성화
  document.querySelectorAll('.footer button').forEach(btn => {
    btn.classList.remove('active');
  });

  // 선택된 탭 버튼 강조
  document.getElementById(tab + 'Btn').classList.add('active');

  // 탭 전환 시 효과음 재생 (아래 함수에서 정의됨)
  playClickSound();

  // 단서 목록 생성하고 표시
  if (tab === 'clues') {
    initClues();
  }

}

/**
 * 피드에서 특정 게시물을 클릭하면 채팅 탭으로 전환
 * → 피드의 게시물 클릭 시 실행됨
 */
function openChat() {
  switchTab('chat');
}

/**
 * 채팅 선택지 클릭 시 실행되는 함수
 * - 사용자의 선택에 따라 대화가 출력되고
 * - 잠시 후 자동으로 리포트 탭으로 이동
 * @param {number} option - 사용자가 선택한 옵션 번호 (1 or 2)
 */

/*function choose(option) {
  const choices = document.getElementById('choices');

  // 기존 선택지를 대화 메시지로 대체
  choices.innerHTML = `
    <div class="chat-msg">
      <span class="chat-sender">루카:</span>
      <span class="chat-text">...그건 내가 보낸 게 아니야. AI가 대신 쓴 거야.</span>
    </div>
  `;

  // 2초 후 자동으로 '리포트' 탭으로 전환
  setTimeout(() => switchTab('report'), 2000);
}*///1027 code

/*function choose(index) {
  const choicesContainer = document.getElementById('choices');
  const room = currentChatRoom;
  if (!room || !room.choices) return;

  const selected = room.choices[index];
  choicesContainer.remove(); // 선택지 제거

  // 💬 선택한 대사 바로 출력
  const chatContainer = document.getElementById('chat');
  const reply = document.createElement('div');
  reply.className = 'chat-msg';
  reply.innerHTML = `
    <span class="chat-sender">탐정:</span>
    <span class="chat-text">${selected.text}</span>
  `;
  chatContainer.appendChild(reply);

  // 📜 이어지는 대화(next) 순차 출력
  if (selected.next && selected.next.length > 0) {
    selected.next.forEach((msg, i) => {
      setTimeout(() => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg';
        msgDiv.innerHTML = `
          <span class="chat-sender">${msg.sender}:</span>
          <span class="chat-text">${msg.text}</span>
        `;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 1200 * (i + 1)); // 💬 1.2초 간격으로 순차 출력
    });
  }
  room.completed = true; // ✅ 대화가 끝났으면 completed 상태로 저장 (재진입 방지)
}*/
function choose(index) {
  const choicesContainer = document.getElementById('choices');
  const room = currentChatRoom;
  if (!room || !room.choices) return;

  const selected = room.choices[index];
  choicesContainer.remove(); // 선택지 제거

  // 1. ✅ 데이터에 즉시 추가: 사용자의 선택
  //    (이 데이터는 채팅방 재진입 시에도 유지됩니다)
  const userReply = { sender: '탐정', text: selected.text };
  room.messages.push(userReply);

  // 2. ✅ 데이터에 즉시 추가: 후속 대화 전체
  //    (후속 대화가 시간차로 화면에 출력되는 것과 관계없이 데이터는 즉시 저장)
  let nextMessages = [];
  if (selected.next && selected.next.length > 0) {
    // 깊은 복사를 통해 메시지 객체를 복사하여 추가
    nextMessages = selected.next.map(msg => ({ sender: msg.sender, text: msg.text }));
    room.messages.push(...nextMessages);
  }

  room.completed = true; // ✅ 완료 상태로 설정 (재진입 시 선택지 출력 방지)

  // 3. 💬 현재 화면에 즉시 출력: 사용자의 선택
  const chatContainer = document.getElementById('chat');
  const reply = document.createElement('div');
  reply.className = 'chat-msg';
  reply.innerHTML = `
    <span class="chat-sender">${userReply.sender}:</span>
    <span class="chat-text">${userReply.text}</span>
  `;
  chatContainer.appendChild(reply);

  // 4. 📜 현재 화면에 순차적으로 출력: 후속 대화 (애니메이션 효과)
  if (nextMessages.length > 0) {
    nextMessages.forEach((msg, i) => {
      setTimeout(() => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg';
        msgDiv.innerHTML = `
          <span class="chat-sender">${msg.sender}:</span>
          <span class="chat-text">${msg.text}</span>
        `;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 1200 * (i + 1)); // 💬 1.2초 간격으로 순차 출력
    });
  }
}

/**
 * 채팅 관련 함수 
 */
// ✅ 채팅방 목록 렌더링
function renderChatList() {
  const chatContainer = document.getElementById('chat');
  chatContainer.innerHTML = '';

  chatData.forEach(room => {
    const div = document.createElement('div');
    div.className = 'chat-room';
    div.innerHTML = `
      <img src="${room.profile}" alt="${room.senderName}" class="chat-profile" />
      <div class="chat-room-text">
        <strong>${room.senderName}</strong>
        <p>${room.preview}</p>
      </div>
      ${room.unread ? '<span class="new-badge">NEW</span>' : ''}
    `;
    div.onclick = () => openChatRoom(room.id);
    chatContainer.appendChild(div);
  });
}

// ✅ 개별 채팅방 열기
/*
function openChatRoom(id) {
  const room = chatData.find(r => r.id === id);
  if (!room) return;

  
  room.unread = false; // 읽음 처리
  currentChatRoom = room;

  const chatContainer = document.getElementById('chat');
  chatContainer.innerHTML = room.messages.map(msg => `
    <div class="chat-msg">
      <span class="chat-sender">${msg.sender}:</span>
      <span class="chat-text">${msg.text}</span>
    </div>
  `).join('');

  // 뒤로 가기 버튼 추가
  const backBtn = document.createElement('button');
  backBtn.textContent = '← 뒤로';
  backBtn.className = 'chat-back-btn'; // ✅ 스타일 적용을 위한 클래스 부여
  backBtn.onclick = renderChatList;
  chatContainer.prepend(backBtn);


 // ✅ 선택지는 완료된 채팅에는 출력 안 함
 if (room.choices && room.choices.length > 0 && !room.completed) {
  const choicesDiv = document.createElement('div');
  choicesDiv.id = 'choices';

  room.choices.forEach((choice, index) => {
    const c = document.createElement('div');
    c.className = 'choice';
    c.textContent = choice.text;
    c.onclick = () => choose(index);
    choicesDiv.appendChild(c);
  });


  chatContainer.appendChild(choicesDiv);

}
}*/
// main.js (598행 부근)
// ✅ 개별 채팅방 열기
function openChatRoom(id) {
  const room = chatData.find(r => r.id === id);
  if (!room) return;

  room.unread = false; // 읽음 처리
  currentChatRoom = room;

  const chatContainer = document.getElementById('chat');
  chatContainer.innerHTML = ''; // 👈 이전 내용을 모두 지웁니다.

  // 뒤로 가기 버튼 추가 (먼저 추가)
  const backBtn = document.createElement('button');
  backBtn.textContent = '← 뒤로';
  backBtn.className = 'chat-back-btn';
  backBtn.onclick = renderChatList;
  chatContainer.prepend(backBtn); // 버튼을 맨 위에 추가

  const initialMessages = room.messages;
  const messageDelay = 1000; // 📢 메시지 간의 지연 시간 (1초)
  let totalDelay = 0; // 누적 지연 시간을 위한 변수

  // 1. 초기 메시지들을 순차적으로 출력
  initialMessages.forEach((msg, i) => {
      totalDelay += messageDelay;

      setTimeout(() => {
          const msgDiv = document.createElement('div');
          msgDiv.className = 'chat-msg';
          msgDiv.innerHTML = `
              <span class="chat-sender">${msg.sender}:</span>
              <span class="chat-text">${msg.text}</span>
          `;
          chatContainer.appendChild(msgDiv); // 메시지 추가
          chatContainer.scrollTop = chatContainer.scrollHeight; // 스크롤 하단으로 이동

          // 2. 마지막 메시지가 출력된 후 선택지 표시
          if (i === initialMessages.length - 1) {
              // ✅ 선택지는 완료된 채팅에는 출력 안 함
              if (room.choices && room.choices.length > 0 && !room.completed) {
                  const choicesDiv = document.createElement('div');
                  choicesDiv.id = 'choices';

                  room.choices.forEach((choice, index) => {
                      const c = document.createElement('div');
                      c.className = 'choice';
                      c.textContent = choice.text;
                      c.onclick = () => choose(index);
                      choicesDiv.appendChild(c);
                  });

                  chatContainer.appendChild(choicesDiv);
              }
          }
      }, totalDelay);
  });

  // 3. 예외 처리: 만약 메시지가 없는 경우, 바로 선택지 표시
  if (initialMessages.length === 0) {
      if (room.choices && room.choices.length > 0 && !room.completed) {
          const choicesDiv = document.createElement('div');
          choicesDiv.id = 'choices';

          room.choices.forEach((choice, index) => {
              const c = document.createElement('div');
              c.className = 'choice';
              c.textContent = choice.text;
              c.onclick = () => choose(index);
              choicesDiv.appendChild(c);
          });

          chatContainer.appendChild(choicesDiv);
      }
  }
}

/** 
 * 피드 관련 함수
*/

function openFeedPopupById(id) { 
  const post = feedData.find(f => f.id === id);
  if (!post) return;
//  openFeedPopup(post.title, post.content, post.image, post.likes);
openFeedPopup(post);
}

function openFeedPopup(post) { //피드 팝업 오픈 함수
  document.getElementById('popup-title').textContent = post.title;
  document.getElementById('popup-content').textContent = post.content;
  document.getElementById('popup-img').src = post.image;
  document.getElementById('popup-likes').textContent = `❤️ ${post.likes}`;

  //새로 추가 댓글 목록 채우기
  const commentsList = document.getElementById('popup-comments-list');
  commentsList.innerHTML = ''; // 기존 댓글 비우기
  if (post.comments && post.comments.length > 0) {
    post.comments.forEach(comment => {
      const commentEl = document.createElement('div');
      commentEl.className = 'comment';
      commentEl.innerHTML = `<span class="floor">${comment.user}</span><span>${comment.text}</span>`;
      commentsList.appendChild(commentEl);
    });
  } else {
    commentsList.innerHTML = '<div class="comment"><span>댓글이 없습니다.</span></div>';
  }
  
  //팝업창 표시
  document.getElementById('feed-popup').classList.remove('hidden');

   // ✅ 대화 트리거: dialogueKey가 있으면 실행
   if (post.dialogueKey) {
    setTimeout(() => {
      // once === true 이면 중복 방지, 아니면 항상 출력
      if (post.once) {
        loadDialogueSet(post.dialogueKey, null, false); // 내부에서 중복 체크
      } else {
        loadDialogueSet(post.dialogueKey, null, false); // 강제 실행
      }
    }, 1000); // 약간 딜레이를 줘서 팝업 뜬 후 다이얼로그 실행
  }
}

function closeFeedPopup() { // 닫기 함수
  document.getElementById('feed-popup').classList.add('hidden');
}

function renderFeed() {
  const feedContainer = document.getElementById('feed');
  feedContainer.innerHTML = ''; // 기존 내용 제거

  feedData.forEach(feed => {
    const post = document.createElement('div');
    post.className = 'post';

    /*post.innerHTML = `
      <img src="${feed.image}" class="post-img" alt="${feed.title}" />
      <div class="post-info">
        <strong>${feed.title}</strong>
        <p class="post-summary">${feed.content}</p> 
        <span class="like">❤️ ${feed.likes}</span>
        ${feed.unread ? '<span class="new-badge">NEW</span>' : ''}
      </div>
    `;*/
    post.innerHTML = `
       <div class="post-img-wrapper">
         <img src="${feed.image}" class="post-img" alt="${feed.title}" />
         ${feed.unread ? '<span class="new-badge">NEW</span>' : ''}
       </div>
       <div class="post-info">
         <strong>${feed.title}</strong>
         <p class="post-summary">${feed.content}</p> 
         <span class="like">❤️ ${feed.likes}</span>
       </div>
      `;
    

    post.onclick = () => {
      openFeedPopup(feed);
      feed.unread = false;              // ✅ 읽음 처리
      renderFeed();                     // ✅ 읽음 상태 반영 위해 리렌더링
    };

    feedContainer.appendChild(post);
  });
}





/**
 * 단서 리스트 화면을 초기화(렌더)하는 함수
 */
function initClues() {
  const listEl = document.getElementById('clue-list');
  listEl.innerHTML = '';
  clues.forEach(clue => {
    const card = document.createElement('div');
    card.className = 'clue-card' + (clue.collected ? ' collected' : '');
    
    // ✅ 이미지 요소 추가
    const img = document.createElement('img');
    img.src = clue.image;
    img.alt = clue.title;
    img.className = 'clue-img';  // 스타일을 위한 클래스

    const title = document.createElement('div');
    title.textContent = clue.title + (clue.collected ? ' ✅' : '');
//    card.textContent = clue.title + (clue.collected ? ' ✅' : '');

    card.appendChild(img);
    card.appendChild(title);    
    card.onclick = () => showClueDetail(clue.id);
    listEl.appendChild(card);
  });
}

/**
 * 단서 상세보기 함수
 * @param {string} clueId - 클릭한 단서의 id
 */
function showClueDetail(clueId) {
  const clue = clues.find(c => c.id === clueId);
  if (!clue) return;

  // 수집 안 됐으면 수집 처리
  if (!clue.collected) {
    clue.collected = true;
    initClues();
  }

  // 상세 UI에 정보 넣기
  document.getElementById('clue-title').textContent = clue.title;
  document.getElementById('clue-description').textContent = clue.description;

  // 이미지 추가
  const imageEl = document.getElementById('clue-image');
  imageEl.src = clue.image;
  imageEl.alt = clue.title;

  // 상세창 보이기
  document.getElementById('clue-detail').classList.remove('hidden');
}

/**
 * 상세보기 닫기 함수
 */
function closeClueDetail() {
  document.getElementById('clue-detail').classList.add('hidden');
}

function switchToClues() {
  switchTab('clues');  // 만약 switchTab이 지원하면, 아니면 별도 처리
  initClues();
}





/**
 * 🗨️ 대사 표시 함수
 * @param {number} index - 현재 대사 순서 (dialogues 배열 인덱스)
 */


/*function startIntroDialogue() {
  currentDialogueSet = [
    { speaker: '루시안', side: 'left', text: '좋아, 이건 시작일 뿐이야.', image: 'assets/char/lucian.png' },
    { speaker: '루시안', side: 'left', text: '해결사 사무소를 열었으니 이제 사건들을 해결해보자!', image: 'assets/char/lucian.png' }
  ];

   // ✅ 대화가 끝나면 메인 화면으로 진입하도록 콜백 지정
  dialogueEndCallback = enterMainUI;
  showDialogue(0);
}*/


function showDialogue(index) {
  const d = currentDialogueSet[index]; // 현재 대화 데이터 가져오기

  // 💡 만약 d가 없다면 (대사 세트가 비었거나 인덱스 오류) 함수 종료
  if (!d) return;

  // 대화창 표시
  const dialogueBox = document.getElementById('dialogue-box');
  dialogueBox.classList.remove('hidden');

  // 캐릭터 이름 / 대사 텍스트 반영
  document.getElementById('speaker-name').textContent = d.speaker;
  document.getElementById('dialogue-text').textContent = d.text;

  // 좌우 캐릭터 이미지 가져오기
  const leftImg = document.getElementById('char-left');
  const rightImg = document.getElementById('char-right');

  // 💡 대사 위치(왼/오)에 따라 이미지 배치 + 강조 표시
  if (d.side === 'left') {
    leftImg.src = d.image;
    leftImg.classList.remove('hidden');
    rightImg.classList.add('hidden');

    leftImg.classList.add('active');
    rightImg.classList.remove('active');
  } else {
    rightImg.src = d.image;
    rightImg.classList.remove('hidden');
    leftImg.classList.add('hidden');

    rightImg.classList.add('active');
    leftImg.classList.remove('active');
  }
}

/**
 * ▶ 다음 대사로 넘어가는 함수
 * - 다음 대화가 있으면 갱신, 없으면 대화 종료
 */
function nextDialogue() {
  currentDialogueIndex++; // 다음 대화로 이동

  // ✅ 'currentDialogueSet'의 길이를 기준으로 판단하도록 수정
   if (currentDialogueIndex < currentDialogueSet.length) { 
    showDialogue(currentDialogueIndex); // 다음 대사 출력
    }
    else {
    // 💬 모든 대사가 끝났을 때
    document.getElementById('dialogue-box').classList.add('hidden');
    currentDialogueIndex = 0; // 인덱스 초기화
    
   // 💡 [매우 중요!] 대사가 끝나면 실행하기로 약속한 콜백 함수를 실행
     if (dialogueEndCallback) {
       dialogueEndCallback(); // (예: startIntroDialogue에서 설정한 enterMainUI 함수 실행)
      dialogueEndCallback = null; // 💡 한 번 실행했으니 비워줌
      }
    }
}

/**
 * 📢 대화 시작 함수
 * - 외부에서 호출 가능 (예: 특정 버튼, 사건 발생 등)
 */

function loadDialogueSet(key, callback, isOneTime = true) {
  // 🔁 1회성 설정이 켜져 있고 이미 본 적 있으면 건너뜀
  if (isOneTime && shownDialogues.has(key)) {
    if (callback) callback();
    return;
  }

  fetch('data/dialogues.json')
    .then(res => res.json())
    .then(data => {
      if (data[key]) {
        currentDialogueSet = data[key];
        currentDialogueIndex = 0;
        dialogueEndCallback = callback || null;
        showDialogue(currentDialogueIndex);

        // ✅ 1회성 설정일 때만 저장
        if (isOneTime) {
          shownDialogues.add(key);
         // localStorage.setItem('shownDialogues', JSON.stringify([...shownDialogues]));
        }
      } else {
        console.warn('해당 키의 대사 없음:', key);
      }
    });
}




/* 
==============================
🚀 초기 실행
==============================
*/

// 페이지가 로드되면 자동으로 인트로 텍스트 출력 시작
window.onload = showIntroText;

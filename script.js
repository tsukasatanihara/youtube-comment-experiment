const jsPsych = initJsPsych({
  on_finish: function() {
    const allTrials = jsPsych.data.get().values();

    let mergedData = {};

    allTrials.forEach(trial => {
      if (trial.response && typeof trial.response === "object") {
        Object.assign(mergedData, trial.response);
      }
    });

    mergedData.comment_condition = commentCondition;
    mergedData.video_condition = selectedVideo.video_condition;
    mergedData.video_id = selectedVideo.video_id;

    if (mergedData.comment_check === "コメント欄はこの報道に批判的だった（比較的穏やか）") {
      mergedData.comment_check = 1;
    } else if (mergedData.comment_check === "コメント欄はこの報道に好意的だった") {
      mergedData.comment_check = 2;
    } else if (mergedData.comment_check === "コメント欄は報道内容と関係がなかった") {
      mergedData.comment_check = 3;
    } else if (mergedData.comment_check === "コメント欄にコメントはなかった") {
      mergedData.comment_check = 4;
    } else if (mergedData.comment_check === "コメント欄はこの報道に批判的だった（かなり攻撃的）") {
      mergedData.comment_check = 5;
    }

    if (mergedData.youtube_news_freq === "1日に複数回") {
      mergedData.youtube_news_freq = 1;
    } else if (mergedData.youtube_news_freq === "1日に1回程度") {
      mergedData.youtube_news_freq = 2;
    } else if (mergedData.youtube_news_freq === "週2，3日に1回程度") {
      mergedData.youtube_news_freq = 3;
    } else if (mergedData.youtube_news_freq === "週に1回程度") {
      mergedData.youtube_news_freq = 4;
    } else if (mergedData.youtube_news_freq === "月に数回程度") {
      mergedData.youtube_news_freq = 5;
    } else if (mergedData.youtube_news_freq === "月に1回程度") {
      mergedData.youtube_news_freq = 6;
    } else if (mergedData.youtube_news_freq === "年に数回程度") {
      mergedData.youtube_news_freq = 7;
    } else if (mergedData.youtube_news_freq === "年に1回程度") {
      mergedData.youtube_news_freq = 8;
    } else if (mergedData.youtube_news_freq === "全く見ない") {
      mergedData.youtube_news_freq = 9;
    }
    // 0始まり -> 1始まり に補正する項目
    const likertKeys = [
      // イデオロギー
      "ideo_9jo",
      "ideo_welfare",
      "ideo_name",
      "ideo_environment",
      "ideo_nuclear",
      "ideo_work",
      "ideo_aikoku",
      "ideo_immigrant",
      "ideo_marriage",

      // テレビ信頼
      "tv_news_trust",

      // 事後評価
      "fairness",
      "bias",
      "satisfaction"
    ];

    likertKeys.forEach(key => {
      if (mergedData[key] !== undefined && mergedData[key] !== null && mergedData[key] !== "") {
        mergedData[key] = Number(mergedData[key]) + 1;
      }
    });

    console.log("Merged participant data:");
    console.log(mergedData);

    // 隠し iframe を作る
    const iframe = document.createElement("iframe");
    iframe.name = "hidden_iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // form を作る
    const form = document.createElement("form");
    form.method = "POST";
    form.action = GAS_URL;
    form.target = "hidden_iframe";
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(mergedData);

    form.appendChild(input);
    document.body.appendChild(form);

    // 送信
    form.submit();

    // 少し待ってからメッセージ表示
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="width:800px; margin:100px auto; text-align:center; font-size:20px;">
          <p>ご協力ありがとうございました。</p>
          <p>回答送信を実行しました。</p>
        </div>
      `;
    }, 1500);
  }
});


const timeline = [];

const GAS_URL = "https://script.google.com/macros/s/AKfycbzi6BX24ENHKGBPOUmFbzyW_woTgFkhGF24Xn-7TjO5OdE9sTVUEFQwKytgVrCxHQXpPA/exec";

// コメント条件をランダム割付
const commentConditions = ['A', 'B', 'C', 'D', 'E'];
const commentCondition = jsPsych.randomization.sampleWithoutReplacement(commentConditions, 1)[0];

// 動画条件をランダム割付
const videoConditions = [
  {
    video_condition: 1,
    video_id: "M7lc1UVf-VE",
    video_title: "国際関係に関する中立的な内容の報道"
  },
  {
    video_condition: 2,
    video_id: "2KhB3zo0lng",
    video_title: "日本国内政治に関する中立的な内容の報道"
  }
];

const selectedVideo = jsPsych.randomization.sampleWithoutReplacement(videoConditions, 1)[0];

jsPsych.data.addProperties({
  comment_condition: commentCondition,
  video_condition: selectedVideo.video_condition,
  video_id: selectedVideo.video_id
});

// 1. 同意画面
const consent = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>研究参加への同意</h2>
    <p>この研究では、ニュース動画を見て感想を回答していただきます。</p>
    <p>参加は任意であり、いつでも中止できます。</p>
    <p>同意いただける場合は、下のボタンを押してください。</p>
  `,
  choices: ['同意して進む']
};

timeline.push(consent);

// 2. 属性アンケート
const demographics = {
  type: jsPsychSurveyHtmlForm,
  html: `
    <p>
      年齢：
      <input name="age" type="number" min="18" max="100" required>
    </p>

    <p>
      性別：
      <select name="gender" required>
        <option value="">選択してください</option>
        <option value="1">男性</option>
        <option value="2">女性</option>
        <option value="3">その他</option>
        <option value="4">回答しない</option>
      </select>
    </p>
  `,
  button_label: '次へ'
};

timeline.push(demographics);

// 2. イデオロギー
const ideologyLabels = [
  "賛成である",
  "やや賛成である",
  "どちらかといえば賛成である",
  "どちらともいえない",
  "どちらかといえば反対である",
  "やや反対である",
  "反対である"
];

const ideologySurvey = {
  type: jsPsychSurveyLikert,
  preamble: `
    <div style="width:1100px; margin:0 auto; text-align:left;">
      <h3>政治的な考え方について</h3>
      <p>以下の各項目について、あなたの考えに最も近いものを選んでください。</p>
    </div>
  `,
  questions: [
    { prompt: "憲法9条を改正する", labels: ideologyLabels, required: true, name: "ideo_9jo" },
    { prompt: "社会保障支出をもっと増やす", labels: ideologyLabels, required: true, name: "ideo_welfare" },
    { prompt: "夫婦別姓を選べるようにする", labels: ideologyLabels, required: true, name: "ideo_name" },
    { prompt: "経済成長と環境保護では環境保護を優先したい", labels: ideologyLabels, required: true, name: "ideo_environment" },
    { prompt: "原発は直ちに廃止する", labels: ideologyLabels, required: true, name: "ideo_nuclear" },
    { prompt: "政府が職と収入をある程度保障する", labels: ideologyLabels, required: true, name: "ideo_work" },
    { prompt: "学校で子供に愛国心を教える", labels: ideologyLabels, required: true, name: "ideo_aikoku" },
    { prompt: "外国人移住者が増えることは日本にとってよくないことである", labels: ideologyLabels, required: true, name: "ideo_immigrant" },
    { prompt: "同性同士の結婚を認める", labels: ideologyLabels, required: true, name: "ideo_marriage" }
  ],
  scale_width: 900,
  button_label: "次へ"
};

timeline.push(ideologySurvey);

// 2. テレビ信頼
const mediaTrustLabels = [
  "信頼している",
  "概ね信頼している",
  "どちらかといえば信頼している",
  "どちらともいえない",
  "どちらかといえば信頼していない",
  "あまり信頼していない",
  "信頼していない"
];

const mediaTrustSurvey = {
  type: jsPsychSurveyLikert,
  preamble: `
    <div style="width:1000px; margin:0 auto; text-align:left;">
      <h3>テレビ報道に対する一般的な考え方について</h3>
      <p>以下の質問について、あなたの考えに最も近いものを選んでください。</p>
    </div>
  `,
  questions: [
    {
      prompt: "あなたは、テレビ報道を一般的にはどれくらい信頼していますか？",
      labels: mediaTrustLabels,
      required: true,
      name: "tv_news_trust"
    }
  ],
  scale_width: 900,
  button_label: "次へ"
};

timeline.push(mediaTrustSurvey);

// 2. YouTubeニュース視聴頻度
const youtubeNewsFreqSurvey = {
  type: jsPsychSurveyMultiChoice,
  preamble: `
    <div style="width:800px; margin:0 auto; text-align:left;">
      <h3>YouTubeでのニュース視聴について</h3>
      <p>以下の質問について、最もあてはまるものを1つ選んでください。</p>
    </div>
  `,
  questions: [
    {
      prompt: "あなたは、YouTubeでニュース報道をどれくらいの頻度で見ますか？",
      name: "youtube_news_freq",
      options: [
        "1日に複数回",
        "1日に1回程度",
        "週2，3日に1回程度",
        "週に1回程度",
        "月に数回程度",
        "月に1回程度",
        "年に数回程度",
        "年に1回程度",
        "全く見ない"
      ],
      required: true
    }
  ],
  button_label: "次へ"
};

timeline.push(youtubeNewsFreqSurvey);

// 条件ごとのコメント欄
function makeCommentHTML(username, text, likes, avatarColor) {
  return `
    <div class="yt-comment">
      <div class="yt-comment-avatar" style="background:${avatarColor};">
        ${username.charAt(0)}
      </div>

      <div class="yt-comment-body">
        <div class="yt-comment-meta">
          <span class="yt-comment-user">${username}</span>
          <span class="yt-comment-time">1日前</span>
        </div>

        <div class="yt-comment-text">
          ${text}
        </div>

        <div class="yt-comment-actions">
          👍 ${likes}
          <span class="yt-comment-reply">返信</span>
        </div>
      </div>
    </div>
  `;
}

let commentBlock = '';

if (commentCondition === 'A') {
  commentBlock = `
      ${makeCommentHTML("media_watcher", "片方の見方に寄って聞こえる箇所があり、もう少し補足があるとよかったです。", 31, "#cc0000")}
      ${makeCommentHTML("neutral_view", "重要な論点がいくつか触れられておらず、受け手が判断しにくい構成だと思います。", 24, "#0066cc")}
      ${makeCommentHTML("citizen_voice", "背景の説明がやや少なく、この話題の見え方がかなり限定されているように感じました。", 18, "#009966")}
      ${makeCommentHTML("citizen_voice2", "事実は示されていますが、文脈の置き方にもう少し慎重さがほしいと感じました。", 9, "#009966")}
    
  `;
} else if (commentCondition === 'B') {
  commentBlock = `
   
      ${makeCommentHTML("news_reader", "立場を決めつけずに説明していて、まず全体像を知るには十分だと感じました。", 31, "#cc6600")}
      ${makeCommentHTML("policy_fan", "短い動画でも必要な論点が押さえられていて、状況をつかみやすかったです。", 24, "#3366cc")}
      ${makeCommentHTML("daily_news", "感情をあおらずに要点を整理していて、落ち着いて見られる内容だったと思います。", 18, "#0099cc")}
      ${makeCommentHTML("daily_news2", "余計な演出が少なく、淡々と情報をまとめている点が見やすかったです。", 9, "#0099cc")}
    
  `;
} else if (commentCondition === 'C') {
  commentBlock = `
  
      ${makeCommentHTML("video_viewer", "字幕が付いているので、音を出せないときでも内容を追いやすいです。", 31, "#999933")}
      ${makeCommentHTML("voice_check", "このくらいの動画の長さだと、移動中でも最後まで見やすいですね。", 24, "#663399")}
      ${makeCommentHTML("timekeeper", "通知で流れてきたので見に来ました。あとで関連動画も確認してみます。", 18, "#666666")}
      ${makeCommentHTML("timekeeper", "最近サムネイルの雰囲気が少し変わりましたね。前より見つけやすいです。", 9, "#666666")}
    
  `;
} else if (commentCondition === 'D') {
  // コメントなし
  commentBlock = `
    
      <div style="color:#606060; font-size:15px;">コメントはありません。</div>
    
  `;
} else if (commentCondition === 'E') {
  // 批判コメント（非礼）
  commentBlock = `
   
      ${makeCommentHTML("hard_truth", "都合のいいところばかり並べていて、見ていてかなり白けた。", 31, "#cc0000")}
      ${makeCommentHTML("critical_eye", "大事な論点を落としすぎ。これで分かった気にさせるのは、さすがに雑すぎる。", 24, "#990000")}
      ${makeCommentHTML("fact_checker", "背景説明が薄すぎる。これじゃ話を雑に切ってるだけで、全然参考にならない。", 18, "#cc3300")}
      ${makeCommentHTML("plain_speaker", "事実を並べれば済むと思ってるのか。文脈の置き方が雑で、正直ひどい。", 9, "#663300")}
    
  `;
}

// 3. 刺激画面（ダミー）
const stimulus = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="yt-page">
      <div class="yt-main">

        <div class="yt-player-wrap">
          <iframe
            class="yt-player"
            src="https://www.youtube.com/embed/${selectedVideo.video_id}?rel=0"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>

        <div class="yt-meta">
          <div class="yt-title">
            ${selectedVideo.video_title}
          </div>

          <div class="yt-submeta">
            12,345 回視聴
          </div>

          <div class="yt-channel-row">
            <div class="yt-channel-left">
              <div class="yt-channel-icon">N</div>
              <div>
                <div class="yt-channel-name">News Channel</div>
                <div class="yt-channel-subs">チャンネル登録者数 12.3万人</div>
              </div>
            </div>

            <button class="yt-subscribe" type="button">登録</button>
          </div>

          <div class="yt-comments">
            ${commentCondition === 'D'
              ? `
                <div class="yt-comments-header">コメント</div>
                <div class="yt-no-comments">コメントはありません。</div>
              `
              : `
                <div class="yt-comments-header">コメント 4件</div>
                ${commentBlock}
              `
            }
          </div>
        </div>
      </div>
    </div>
  `,
  choices: ['次へ']
};

timeline.push(stimulus);

// 4. 事後アンケート
const postSurvey = {
  type: jsPsychSurveyLikert,
  preamble: `
    <div style="width:800px; margin:0 auto; text-align:left;">
      <h3>事後アンケート</h3>
      <p>以下の各項目について、あなたの考えに最も近いものを選んでください。</p>
      <p>1 = まったくそう思わない、7 = とてもそう思う</p>
    </div>
  `,
  questions: [
    {
      prompt: "この報道は公平だと感じた",
      labels: ["1", "2", "3", "4", "5", "6", "7"],
      required: true,
      name: "fairness"
    },
    {
      prompt: "この報道は偏っていると感じた",
      labels: ["1", "2", "3", "4", "5", "6", "7"],
      required: true,
      name: "bias"
    },
    {
      prompt: "この報道に満足した",
      labels: ["1", "2", "3", "4", "5", "6", "7"],
      required: true,
      name: "satisfaction"
    }
  ],
  scale_width: 700,
  button_label: "次へ"
};

timeline.push(postSurvey);

const manipulationCheck = {
  type: jsPsychSurveyMultiChoice,
  preamble: `
    <div style="width:800px; margin:0 auto; text-align:left;">
      <h3>コメント欄についての質問</h3>
      <p>この画面に表示されたコメント欄について、最もあてはまるものを1つ選んでください。</p>
    </div>
  `,
  questions: [
    {
      prompt: "コメント欄について、最もあてはまるものはどれですか。",
      name: "comment_check",
      options: [
        "コメント欄はこの報道に批判的だった（比較的穏やか）",
        "コメント欄はこの報道に好意的だった",
        "コメント欄は報道内容と関係がなかった",
        "コメント欄にコメントはなかった",
        "コメント欄はこの報道に批判的だった（かなり攻撃的）"
      ],
      required: true
    }
  ],
  button_label: "次へ"
};

timeline.push(manipulationCheck);

// 5. 終了画面
const endScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<p>ご協力ありがとうございました。</p>`,
  choices: ['終了']
};

timeline.push(endScreen);

jsPsych.run(timeline);
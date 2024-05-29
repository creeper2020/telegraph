// worker-设置-触发器-添加自定义域
const domain = 'example.com';

// 监听 fetch 事件
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 处理请求的函数
async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/') {
    return handleRootRequest();
  } else if (pathname === '/upload' && request.method === 'POST') {
    return handleUploadRequest(request);
  } else {
    // 构建新的请求 URL
    const url = new URL(request.url);
    url.hostname = 'telegra.ph';

    // 发起原始请求并返回响应
    return fetch(url, request);
  }
}

// 处理根路径请求的函数
function handleRootRequest() {
  const html = 
  `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover">
    <meta name="description" content="基于Cloudflare Workers的图床服务">
    <meta name="keywords" content="Workers图床, Cloudflare, Workers, JIASU.IN, 图床">
    <title>基于Workers的图床服务</title>
    <link rel="icon" href="https://p1.meituan.net/csc/c195ee91001e783f39f41ffffbbcbd484286.ico" type="image/x-icon">
    <!-- Twitter Bootstrap CSS -->
    <link href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/twitter-bootstrap/4.6.1/css/bootstrap.min.css" type="text/css" rel="stylesheet" />
    <!-- Bootstrap FileInput CSS -->
    <link href="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/css/fileinput.min.css" type="text/css" rel="stylesheet" />
    <!-- Toastr CSS -->
    <link href="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/toastr.js/2.1.4/toastr.min.css" type="text/css" rel="stylesheet" />
    <!-- jQuery -->
    <script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js" type="application/javascript"></script>
    <!-- Bootstrap FileInput JS -->
    <script src="https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/js/fileinput.min.js" type="application/javascript"></script>
    <!-- Bootstrap FileInput Chinese Locale JS -->
    <script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/bootstrap-fileinput/5.2.7/js/locales/zh.min.js" type="application/javascript"></script>
    <!-- Toastr JS -->
    <script src="https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/toastr.js/2.1.4/toastr.min.js" type="application/javascript"></script> 
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Long+Cang&display=swap');
    
    .title {
      font-family: "Long Cang", cursive;
      font-weight: 400;
      font-style: normal;
      font-size: 2em; /* 调整字体大小 */
      text-align: center;
      margin-top: 20px; /* 调整距离顶部的距离 */
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 添加阴影效果 */
    }
    </style>
    </head> 
    <body>
    <div class="card">
    <div class="title">JIASU.IN</div>
    <div class="card-body">
      <!-- 表单 -->
      <form id="uploadForm" action="/upload" method="post" enctype="multipart/form-data">
        <!-- 接口选择下拉菜单 -->
        <div class="form-group mb-3">
          <select class="custom-select" id="interfaceSelector" name="interface">
            <option value="tg">TG</option>
          </select>
        </div>
        <!-- 文件选择 -->
        <div class="form-group mb-3">
          <input id="fileInput" name="file" type="file" class="form-control-file" data-browse-on-zone-click="true">
        </div>            
        <!-- 添加按钮组 -->
        <div class="form-group mb-3" style="display: none;"> <!-- 初始隐藏 -->
          <button type="button" class="btn btn-light mr-2" id="urlBtn">URL</button>
          <button type="button" class="btn btn-light mr-2" id="bbcodeBtn">BBCode</button>
          <button type="button" class="btn btn-light" id="markdownBtn">Markdown</button>
        </div>
        <!-- 文件链接文本框 -->
        <div class="form-group mb-3" style="display: none;"> <!-- 初始隐藏 -->
          <textarea class="form-control" id="fileLink" readonly></textarea>
        </div>
        <!-- 上传中的提示 -->
        <div id="uploadingText" style="display: none; text-align: center;">文件上传中...</div>
        <!-- 压缩中的提示 -->
        <div id="compressingText" style="display: none; text-align: center;">图片压缩中...</div>
      </form>
    </div>
    <p style="font-size: 14px; text-align: center;">
      项目开源于 GitHub - <a href="https://github.com/0-RTT/telegraph" target="_blank" rel="noopener noreferrer">0-RTT/telegraph</a>
    </p>   
  </div>  
<script>
$(document).ready(function() {
  let originalImageURL = '';

  // 初始化文件上传 
  initFileInput();
  
  // 文件上传初始化函数
  function initFileInput() {
    $("#fileInput").fileinput({
      theme: 'fa',
      language: 'zh',
      dropZoneEnabled: true,
      browseOnZoneClick: true,
      dropZoneTitle: "拖拽或粘贴文件到这里...",
      dropZoneClickTitle: "",
      browseClass: "btn btn-light",
      uploadClass: "btn btn-light",
      removeClass: "btn btn-light",
      showUpload: false,
      layoutTemplates: {
        actionZoom: '',
      },
    }).on('filebatchselected', handleFileSelection)
      .on('fileclear', handleFileClear);
  }

  // 配置接口信息
  const interfaceConfig = {
    tg: {
      acceptTypes: 'image/gif,image/jpeg,image/jpg,image/png,video/mp4',
      gifAndVideoMaxSize: 5 * 1024 * 1024, // GIF 和视频文件的最大大小为 5MB
      otherMaxSize: 5 * 1024 * 1024, // 非 GIF 和视频文件的最大大小为 5MB
      compressImage: true //默认开启压缩
    },
    // 添加其他接口的配置信息
  };
  
  // 处理接口选择器变更事件  
  $('#interfaceSelector').change(function() {
    const selectedInterface = $(this).val();
    const interfaceInfo = interfaceConfig[selectedInterface];
    
    if (interfaceInfo) {
      $('#fileInput').attr('accept', interfaceInfo.acceptTypes);
    }
  }).trigger('change');
  
  // 处理文件选择事件  
  async function handleFileSelection() {
      const file = $('#fileInput')[0].files[0];
  
      if (file) {
          await uploadFile(file);
      }
  }

  // 处理上传文件函数
  async function uploadFile(file) {
      try {
          const selectedInterface = $('#interfaceSelector').val();
          const interfaceInfo = interfaceConfig[selectedInterface];
          
          if (!interfaceInfo) {
            console.error('未找到接口配置信息');
            return;
          }
  
          if (['image/gif', 'video/mp4'].includes(file.type)) {
              if (file.size > interfaceInfo.gifAndVideoMaxSize) {
                  toastr.error('文件必须≤' + interfaceInfo.gifAndVideoMaxSize / (1024 * 1024) + 'MB');
                  return;
              }
              // 不压缩，直接上传原文件
          } else {
              if (interfaceInfo.compressImage === true) {
                  const compressedFile = await compressImage(file);
                  file = compressedFile;
              } else if (interfaceInfo.compressImage === false) {
                  if (file.size > interfaceInfo.otherMaxSize) {
                      toastr.error('文件必须≤' + interfaceInfo.otherMaxSize / (1024 * 1024) + 'MB');
                      return;
                  }
                  // 不压缩，直接上传原文件
              }
          }
  
          $('#uploadingText').show();
          const formData = new FormData($('#uploadForm')[0]);
          formData.set('file', file, file.name);
          const uploadResponse = await fetch('/upload', { method: 'POST', body: formData });
          originalImageURL = await handleUploadResponse(uploadResponse);
          $('#fileLink').val(originalImageURL);
          $('.form-group').show();
          adjustTextareaHeight($('#fileLink')[0]);
      } catch (error) {
          console.error('上传文件时出现错误:', error);
          $('#fileLink').val('文件上传失败！');
      } finally {
          $('#uploadingText').hide();
      }
  }

  // 处理上传响应函数
  async function handleUploadResponse(response) {
    if (response.ok) {
      const result = await response.json();
      return result.data;
    } else {
      return '文件上传失败！';
    }
  }

  // 监听粘贴事件
  $(document).on('paste', function(event) {
      // 获取粘贴板中的内容
      const clipboardData = event.originalEvent.clipboardData;
      if (clipboardData && clipboardData.items) {
          // 遍历粘贴板中的项
          for (let i = 0; i < clipboardData.items.length; i++) {
              const item = clipboardData.items[i];
              // 如果是文件类型
              if (item.kind === 'file') {
                  const pasteFile = item.getAsFile();
                  // 上传粘贴的文件
                  uploadFile(pasteFile);
                  break; // 处理完第一个文件即可
              }
          }
      }
  });

  //处理图片压缩事件
  async function compressImage(file, quality = 0.5, maxResolution = 20000000) {
    $('#compressingText').show();
  
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const width = image.width;
        const height = image.height;  
        const resolution = width * height;  
        let scale = 1;
        if (resolution > maxResolution) {
          scale = Math.sqrt(maxResolution / resolution);
        }  
        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');  
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight); 
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
          $('#compressingText').hide();
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };  
      const reader = new FileReader();
      reader.onload = (event) => {
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  
  // 处理按钮点击事件 
  $('#urlBtn, #bbcodeBtn, #markdownBtn').on('click', function() {
    const fileLink = originalImageURL.trim();
    if (fileLink !== '') {
      let formattedLink;
      switch ($(this).attr('id')) {
        case 'urlBtn':
          formattedLink = fileLink;
          break;
        case 'bbcodeBtn':
          formattedLink = '[img]' + fileLink + '[/img]';
          break;
        case 'markdownBtn':
          formattedLink = '![image](' + fileLink + ')';
          break;
        default:
          formattedLink = fileLink;
      }
      $('#fileLink').val(formattedLink);
      adjustTextareaHeight($('#fileLink')[0]);
      copyToClipboardWithToastr(formattedLink);
    }
  });
  
  // 处理移除按钮点击事件 
  function handleFileClear(event) {
    $('#fileLink').val('');
    adjustTextareaHeight($('#fileLink')[0]);
    hideButtonsAndTextarea();
  }
  
  // 自动调整文本框高度函数
  function adjustTextareaHeight(textarea) {
    textarea.style.height = '1px';
    textarea.style.height = (textarea.scrollHeight) + 'px';
  }
  
  // 复制文本到剪贴板，并显示 toastr 提示框 
  function copyToClipboardWithToastr(text) {
    const input = document.createElement('input');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    toastr.success('已复制到剪贴板', '', { timeOut: 300 });
  }
  
  // 隐藏按钮和文本框
  function hideButtonsAndTextarea() {
    $('#urlBtn, #bbcodeBtn, #markdownBtn, #fileLink').parent('.form-group').hide();
  }
  
});

</script>

</body>
</html>
  `;

// 返回 HTML 内容，并设置响应头为 UTF-8 编码
return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// 接口配置对象，包含各平台的上传配置
  const interfaceConfigs = {
    tg: {
      uploadURL: 'https://telegra.ph/upload',
      prepareFormData: async function(file, formData) {
        const uploadHeaders = {};
        return {
          url: this.uploadURL,
          headers: uploadHeaders,
          body: formData
        };
      }
    }
  };

// 处理上传请求的函数  
  async function handleUploadRequest(request) {
    try {
      const formData = await request.formData();
      const selectedInterface = formData.get('interface');
      const file = formData.get('file');
  
      if (!selectedInterface || !file) {
        throw new Error('Missing interface or file');
      }
  
      const config = interfaceConfigs[selectedInterface];
      if (!config) {
        throw new Error('Interface configuration not found');
      }
  
      const preparedFormData = await config.prepareFormData(file, formData);
      const response = await fetch(preparedFormData.url, {
        method: 'POST',
        headers: preparedFormData.headers,
        body: preparedFormData.body
      });
  
      if (!response.ok) {
        throw new Error('Upload Failed');
      }
  
      const responseData = await response.json();
      const imageURL = getImageURL(selectedInterface, responseData);
  
      const jsonResponse = { data: imageURL };
      return new Response(JSON.stringify(jsonResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Internal Server Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
  
// 获取图片链接的函数  
  function getImageURL(selectedInterface, responseData) {
    let url;
  
    switch (selectedInterface) {
      case 'tg':
        url = `https://${domain}${responseData[0].src}`;
        break;
      default:
        throw new Error('Unexpected response format');
    }
    
    return url;
  }

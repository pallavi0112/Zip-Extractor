const model = (() => {

    return {
      getEntries(file, options) {
        return (new zip.ZipReader(new zip.BlobReader(file))).getEntries(options);
      },
      async getURL(entry, options) {
        return URL.createObjectURL(await entry.getData(new zip.BlobWriter(), options));
      }
    };

  })();
  const fileInput = document.getElementById("file-input");
  const fileInputButton = document.getElementById("file-input-button");
  let selectedFile;
  let entries;

  fileInputButton.onclick = (e) => { e.preventDefault(); fileInput.dispatchEvent(new MouseEvent("click")); }
  fileInput.onchange = selectFile;
  const appContainer = document.getElementById("container");


  async function selectFile() {
    try {
      fileInputButton.disabled = true;
      selectedFile = fileInput.files[0];
      await loadFiles("utf-8");
    } catch (error) {
      alert(error);
    } finally {
      fileInputButton.disabled = false;
      fileInput.value = "";
    }
  }


  async function loadFiles(filenameEncoding) {
    entries = await model.getEntries(selectedFile, filenameEncoding);
    if (entries && entries.length) {
      const filenamesUTF8 = Boolean(!entries.find(entry => !entry.filenameUTF8));
      const encrypted = Boolean(entries.find(entry => entry.encrypted));

      var res = buildTree();
      addtree(JSON.stringify(res));
    }
  }


  let result = [];
  function buildTree() {
    let level = {
      result
    };

    entries.forEach((item,entryIndex) => {
      if (typeof item.filename != "undefined") {
        var obj = {}
        var path = ""
        item.filename.split('/').reduce( (r, text, i, a) => {
          if (text) {

            if (!r[text]) {
              r[text] = {
                result: []
              };
              obj = {
                text,
                children: r[text].result
              }
              if (r[text].result.length < 1 && !item.directory) {
               
              obj["a_attr"] = { "href": "", "data-index": entryIndex };
              obj["icon"] = "Images/file.png"
              }
              r.result.push(obj)
            }
            return r[text];
          }
        }, level)
      }
    })
    return result;
  }
  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', text);
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
function addtree(res){
$('#jstree_tree').bind('select_node.jstree', function (e, data) {
  e.preventDefault();
  data.instance.toggle_node(data.node);
  var node_id   = ("#"+data.node.id+"_anchor");
  var desc = $(node_id).attr("data-index");
  console.log(desc)
  if(desc!=undefined){
    const blobURL =  model.getURL(entries[Number(desc)], {
      password: null
    })
    .then(data=>{
      $(node_id).attr("href",String(data));
      $(node_id).attr("download","");
      download(entries[Number(desc)].filename,String(data));

    });
  }
  
}).jstree({
  'core' : {
      'data' : eval(res)
  }});
}
var fs = require('fs'),
    path = require('path');

const defaultExts = require('./extentions');

/**
 * Helps to find and serve files in the created
 * resource subfolders. 
 * 
 * @todo add extensions
 */
class Resourcer {
  constructor({
    view=false,
    react=false,
    exts=defaultExts,
    root
  }){
    this.errorroot = path.join(root,'errors');
    this.pubroot = path.join(root,'public');
    this.viewroot = path.join(root,'controls');
    this.approot = path.join(root,'app');

    this.runlist=[this.publicRun];//attach folder runner

    if(view){this.runlist.push(this.controlRun)}
    if(react){
      this.applist = null;
      fs.readdir(this.approot,(err,files)=>{
        if(!err){
          this.applist=files;
          this.runlist.unshift(this.appRun);//runs apps first
        }
      })
    }


    this.exts = exts; //'Set MIMI TYPES';
  }

  /**
   * Checks file for acceptable .extensions
   * @param {String} path
   * @returns 
   */
  verifyExt=(path)=>{
    for(let x=0;x<this.exts.length;x++){
      if(path.match(this.exts[x].ext)){return this.exts[x]}
    }return null;
  }

  /**
   * Takes a file path and, if it exists, returns a pak
   * ready to stream it to response
   * If it does not, FALSE is returned
   * 
   * @param {String} path
   * @returns 
   */
  verifyFile=(path)=>{
    return new Promise((resolve,reject)=>{
      let contype = this.verifyExt(path);
      if(contype){
        fs.stat(path,(err,stat)=>{
          let pak = {
            contype:contype,
            status:200,
            stream:null,
            stat:stat,
            err:err
          }
          if(!pak.err){
            pak.stream = fs.createReadStream(path);
            return resolve(pak);
          }else{return resolve(false);}
        })
      }else{return resolve(false)}
    })
  }

  /**
   * Take a file stream and send it to the
   * resquester.
   * 
   * @param {*} stream 
   * @param {*} contype 
   * @param {*} status 
   * @param {*} res 
   */
  pipeResult=({
    status,
    stat,
    contype,
    stream
  },res)=>{
    return new Promise((resolve,reject)=>{
      let pak = {
        success:true,
        msg:'Sent'
      }
      res.setHeader('X-Content-Type-Options','nosniff'); //<-move into pipe function?
      //res.setHeader('Content-Length',stat.size);
      res.writeHead(status,{"Content-Type":contype.type});
      let pipe = stream.pipe(res);
      pipe.on('finish',(err)=>{
        res.end();
        return resolve(pak);
      })
      pipe.on('error',(err)=>{
        pak.msg = err;
        pak.success=false
        return resolve(pak);
      })
    })
  }

  /**
   * Handles the serving of react apps and their
   * resources.
   * @param {String} url 
   * @param {Object} res 
   * @returns 
   */
  appRun = (url="")=>{
    return new Promise((resolve,reject)=>{
      let apath = (()=>{//trim no react valid path
        let purl = url.split('/');
        let npath = '';
        let found = -1;
        for(let x=0,l=this.applist.length;x<l;x++){//loop to find app name
          if(this.applist.includes(purl[x])){
            found = x;
            break;
          }
        }
        if(found>-1){//loop back to form new relative path
          for(let x=found;x<purl.length;x++){npath+='/'+purl[x];}
          return npath
        }else{return false}
      })()
      console.log(apath);
      if(apath){
        apath = apath.split('/').length<=2?path.join(this.approot,apath,'index.html'):path.join(this.approot,apath);
        this.verifyFile(apath).then(result=>{return resolve(result);});
      }else{return resolve(false);}
    })
  }

  /**
   * 
   * @param {String} url 
   * @param {Object} res 
   * @returns 
   */
  publicRun = (url="")=>{
    return new Promise((resolve,reject)=>{
      this.verifyFile(path.join(this.pubroot,url)).then(result=>{
        return resolve(result);
      });
    });
  }
  
  /**
   * 
   * @param {String} url 
   * @returns 
   */
  controlRun = (url="")=>{
    return new Promise((resolve,reject)=>{
      this.verifyFile(`${path.join(this.viewroot,url)}.html`).then(result=>{//check path 'unchanged'
        return resolve(result);
      })
    });
  }

  errorRun = (url="",status)=>{
    return new Promise((resolve,reject)=>{
      this.verifyFile(path.join(this.errorroot,`${status}.html`)).then(result=>{//check path 'unchanged'
        return resolve(result);
      })
    });
  }
  /**
   * used to go through all locations for a file existence.
   * 
   * @param {String} url 
   * @param {Number} count 
   * @returns 
   */
  runner=(url='',count=0)=>{
    return new Promise((resolve,reject)=>{
      let find = count<this.runlist.length?this.runlist[count](url):null;
      if(find){
        find.then(result=>{
          if(result){return resolve(result);}
          else{return resolve(this.runner(url,++count));}
        });
      }else{return resolve(false)}
    });
  }

  getResource = (url='',res)=>{
    return new Promise((resolve,reject)=>{
      if(res){
        this.runner(url).then(result=>{
          if(result){
            return resolve(this.pipeResult(result,res));
          }else{
            this.errorRun(url,'404').then(eresult=>{
              if(eresult){
                eresult.status = '404';
                return resolve(this.pipeResult(eresult,res));
              }else{
                res.end();
                return resolve(true)
              }
            });
          }
        });
      }else{return resolve({success:false,msg:'No Response Object'});}
    })
  }
}

module.exports={
  Resourcer
}

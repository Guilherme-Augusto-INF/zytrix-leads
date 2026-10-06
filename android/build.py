#!/usr/bin/env python3
"""Build/sign the dependency-free Android companion using official SDK tools.
Signing credentials MUST come from private external paths/environment, never Git.
"""
import hashlib,json,os,pathlib,shutil,subprocess,tempfile,zipfile
root=pathlib.Path(__file__).resolve().parent
sdk=pathlib.Path(os.environ['ANDROID_SDK_ROOT'])
tools=sdk/'android-15'  # Build Tools 35.0.0 extracted official archive; see README.
if not tools.exists(): tools=sdk/'build-tools'/'35.0.0'
platform=sdk/'android-35'/'android.jar'
if not platform.exists(): platform=sdk/'platforms'/'android-35'/'android.jar'
keystore=pathlib.Path(os.environ['ZYTRIX_ANDROID_KEYSTORE']).resolve()
assert keystore.exists() and 'ZYTRIX_ANDROID_PASSWORD' in os.environ
if root.parent in keystore.parents:raise ValueError('Signing keystore must remain outside the repository')
output=root.parent/'public'/'downloads'/'zytrix-leads-1.0.0.apk'
output.parent.mkdir(parents=True,exist_ok=True)
def run(*args):subprocess.run([str(a) for a in args],check=True)
with tempfile.TemporaryDirectory(prefix='zytrix-apk-') as tmp:
    work=pathlib.Path(tmp);classes=work/'classes';classes.mkdir();dex=work/'dex';dex.mkdir()
    aapt=tools/'aapt2';unsigned=work/'unsigned.apk';aligned=work/'aligned.apk'
    run(aapt,'compile','--dir',root/'res','-o',work/'res.zip')
    run(aapt,'link','-o',unsigned,'--manifest',root/'AndroidManifest.xml','-I',platform,work/'res.zip')
    sources=list((root/'src').rglob('*.java'))
    if os.environ.get('ZYTRIX_ECJ_JAR'):
        run('java','-jar',os.environ['ZYTRIX_ECJ_JAR'],'-source','1.8','-target','1.8','-bootclasspath',platform,'-d',classes,*sources)
    else:run('javac','-source','8','-target','8','-bootclasspath',platform,'-d',classes,*sources)
    run('java','-cp',tools/'lib'/'d8.jar','com.android.tools.r8.D8','--release','--min-api','23','--lib',platform,'--output',dex,*classes.rglob('*.class'))
    with zipfile.ZipFile(unsigned,'a',compression=zipfile.ZIP_DEFLATED) as archive:
        for file in dex.glob('*.dex'):archive.write(file,file.name)
    run(tools/'zipalign','-f','-p','4',unsigned,aligned)
    run('java','-jar',tools/'lib'/'apksigner.jar','sign','--ks',keystore,'--ks-key-alias','zytrix','--ks-pass','env:ZYTRIX_ANDROID_PASSWORD','--key-pass','env:ZYTRIX_ANDROID_PASSWORD','--v4-signing-enabled','false','--out',output,aligned)
    run('java','-jar',tools/'lib'/'apksigner.jar','verify','--verbose','--print-certs',output)
    run(tools/'zipalign','-c','-p','4',output)
metadata={'version':'1.0.0','versionCode':1,'package':'com.zytrix.leads','minAndroid':'6.0','filename':output.name,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest()}
(output.parent/'android-release.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata))

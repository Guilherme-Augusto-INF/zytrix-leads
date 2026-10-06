#!/usr/bin/env python3
"""Verify actual distributed APK with SDK tools, never execute production requests."""
import hashlib,json,os,pathlib,subprocess,zipfile
root=pathlib.Path(__file__).resolve().parent.parent
sdk=pathlib.Path(os.environ['ANDROID_SDK_ROOT']);tools=sdk/'android-15'
if not tools.exists():tools=sdk/'build-tools'/'35.0.0'
metadata=json.loads((root/'public/downloads/android-release.json').read_text())
apk=root/'public/downloads'/metadata['filename']
passed=0
def check(name,condition):
    global passed
    assert condition,name
    passed+=1;print('PASS',name)
check('download metadata matches exact APK bytes',apk.stat().st_size==metadata['bytes'] and hashlib.sha256(apk.read_bytes()).hexdigest()==metadata['sha256'])
with zipfile.ZipFile(apk) as z:
    names=z.namelist()
    check('APK includes compiled manifest, resources and executable DEX',{'AndroidManifest.xml','resources.arsc','classes.dex'}.issubset(names) and z.read('classes.dex').startswith(b'dex\n'))
    check('APK contains no signing keystore, env file or native library',not any(n.endswith(('.p12','.jks','.keystore','.env','.so')) for n in names))
    dex=z.read('classes.dex')
    check('DEX contains fixed HTTPS application URL and no WebView',b'https://zytrix-leads.guilhermeaugusto2525.chatgpt.site/' in dex and b'Landroid/webkit/WebView;' not in dex)
badging=subprocess.check_output([str(tools/'aapt2'),'dump','badging',str(apk)],text=True)
check('launcher package, Android 6 minimum and API 35 target match release',"name='com.zytrix.leads'" in badging and "minSdkVersion:'23'" in badging and "targetSdkVersion:'35'" in badging and 'com.zytrix.leads.MainActivity' in badging)
check('no requested permissions or debuggable flag', 'uses-permission' not in badging and 'application-debuggable' not in badging)
result=subprocess.check_output(['java','-jar',str(tools/'lib/apksigner.jar'),'verify','--verbose',str(apk)],text=True)
check('APK signature verifies v1, v2 and v3',all(s in result for s in ['Verified using v1 scheme (JAR signing): true','Verified using v2 scheme (APK Signature Scheme v2): true','Verified using v3 scheme (APK Signature Scheme v3): true']))
subprocess.run([str(tools/'zipalign'),'-c','-p','4',str(apk)],check=True)
check('APK alignment verifies',True)
built=root/'dist/client/downloads'/metadata['filename']
if built.exists():check('website build serves the exact signed APK',built.read_bytes()==apk.read_bytes())
print(f'Android APK: {passed} checks passed. Device installation/login NOT VERIFIED.')

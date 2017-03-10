"C:\Program Files\7-Zip\7z.exe" u activitymanager.zip *.js
aws lambda update-function-code --function-name ActivityManager --zip-file "fileb://activitymanager.zip"
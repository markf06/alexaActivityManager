A custom Alexa Skill for performing a workflow of your choice.

It  links to a remote server that manages state.  Its primary intention is to drive a VR application written in Unity3D using purely voice.

The custom skill is runs a lambda function in AWS using nodejs (index.js).  The handlers for the intents links to another nodejs server (code not in this repository) that manages the state, this is currently run on an ubuntu VM on EC2.

The Unity app polls this state server to control the selection of the scene being rendered.

The flow is basically:

Amazon Echo -> Lambda -> EC2 -> Unity

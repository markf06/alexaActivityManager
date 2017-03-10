/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 **/
 
'use strict';

const Alexa = require('alexa-sdk');
const activities = require('./activities');
const http = require('http');
const jsonPath = require('JSONPath');

var options = {
    host: '54.171.141.27',
    path: '/api/state',
    port: '80',
    method: 'GET',
    'Content-Type': 'application/json',
    cmd_val: -1
};

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).

const handlers = {
    'NewSession': function () {
        options.cmd_val = null;
        options.path = '/api/reset'
        processReq(this, null);
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));

        // If the user either does not reply to the welcome messageor says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'GetActivities': function () {
        console.log('get activities');
        //var self = this;
        options.path = "/api/command/show_activities"
        options.cmd_val = -1;
        processReq(this, processActivities);
    },
    'GetActivity': function () {
        let itemSlot = this.event.request.intent.slots.Activity;
        console.log('item slot ' + itemSlot.name);
        console.log('start activity');
        let self = this;
        if (itemSlot)
        {
            options.path = this.t('/api/command/select_task_%s', itemSlot.value);
            options.cmd_val = itemSlot;
            processReq(this, processActivity);        
        }
    },
    'GetRequirements' : function() {
        console.log('show_requirements');

    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

function processReq(self, alexaResponseCallBack){
        http.get(options, (res)  => {
        const statusCode = res.statusCode;
        const contentType = res.headers['content-type'];
        let error;

        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.log(error.message);
            res.resume();
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            try {
                var parsedData = JSON.parse(rawData);
                console.log('parsedData2: ' + parsedData.ok);                
                //if (parsedData.ok) {
                //    if (alexaResponseCallBack)
                if (alexaResponseCallBack(self, parsedData) == false)
                    badStateServerResponse(self,parsedData);
                console.log(parsedData);
            } catch (e) {
                console.log(e.message);
            }
        });
    });
}

function badStateServerResponse(self, jsonData){
    console.log('in badStateServerResponse');
    self.attributes.speechOutput = self.t('COMMAND_NOT_FOUND_MESSAGE'); 
    self.attributes.repromptSpeech = self.t('WELCOME_REPROMPT');
    self.emit(':ask', self.attributes.speechOutput, self.attributes.repromptSpeech);    
}

function processActivities(self, jsonData){
    try{
        var str2Say = '';
        var acts = self.t('ACTIVITIES');
        for(var i=0; i<acts.length; i++){
            let key = acts[i].activity.key;
            console.log('key: ' + key);
            str2Say += acts[i].activity.summary + ".. Say select option " + key + " to start..."
            if (i < acts.length-1) str2Say += ". also, " 
        };
        self.attributes.speechOutput = self.t(str2Say, self.t('SKILL_NAME')); 
    
        //self.attributes.speechOutput = self.t(jsonData.res.current_stage, self.t('SKILL_NAME'));
        self.attributes.repromptSpeech = self.t('WELCOME_REPROMPT');
        self.emit(':ask', self.attributes.speechOutput, self.attributes.repromptSpeech); 
        return true; 
    }  
    catch(e) {
        return false;
    }
}
function processActivity(self, jsonData){
    try{
        let activity = null;
        console.log('in processActivity');
        let itemSlot = options.cmd_val;
        console.log('itemSlot.value: ' + itemSlot.value);        
        for (var i=0;i < self.t('ACTIVITIES').length;i++) {
            if (self.t('ACTIVITIES')[i].activity.key == itemSlot.value) {
                activity = self.t('ACTIVITIES')[i].activity;
                break;
            }
        }
        //const activity = jsonPath(activities.ACTIVITIES_EN_GB.workflow, this.t('$..activities[?(@.activity.key==%s)].activity', itemSlot.value));
        if (activity) {
            console.log('activity.detail: ' + activity.detail);
            self.attributes.speechOutput = activity.detail;
            self.attributes.repromptSpeech = self.t('ACTIVITY_REPEAT_MESSAGE');
            // this.emit(':askWithCard', this.attributes.speechOutput, this.attributes.repromptSpeech, cardTitle, activity);
            self.emit(':ask', self.attributes.speechOutput, self.attributes.repromptSpeech);    
        } else {
            let speechOutput = '';
            const repromptSpeech = self.t('ACTIVITY_NOT_FOUND_REPROMPT');
            if (itemSlot.value) {
                speechOutput = self.t('ACTIVITY_NOT_FOUND_FOR_VALUE', itemSlot.value);
            } else {
                speechOutput = self.t('ACTIVITY_NOT_FOUND_WITHOUT_VALUE');
            }
            //speechOutput += repromptSpeech;

            self.attributes.speechOutput = speechOutput;
            self.attributes.repromptSpeech = repromptSpeech;

            self.emit(':ask', speechOutput, repromptSpeech);
        }
        return true;
    }
    catch(e){
        return false;
    }
}

const languageStrings = {
    'en-GB': {
        translation: {
            ACTIVITIES: activities.ACTIVITIES_EN_GB.workflow.activities,
            SKILL_NAME: 'Activity Manager',
            WELCOME_MESSAGE: "Welcome to %s. you begin by asking for the activities assigned to you, what\'s the activity for today? ... Now, what can I help you with.",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - activity for %s.',
            HELP_MESSAGE: "You can ask questions such as, what\'s the activity, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMPT: "You can say things like, what\'s the activity, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            ACTIVITY_REPEAT_MESSAGE: 'Try saying repeat.',
            ACTIVITY_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know ",
            ACTIVITY_NOT_FOUND_FOR_VALUE: 'Activity number %s is not valid. Please select a current activity for your inbox.',
            ACTIVITY_NOT_FOUND_WITHOUT_VALUE: 'you need to specify a valid activity number with your request',
            ACTIVITY_NOT_FOUND_REPROMPT: 'What else can I help with?',
            COMMAND_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know that command please can you repeat or say repeat, or say Cancel to restart.",
        },
    },
    'en-US': {
        translation: {
            ACTIVITIES: activities.ACTIVITIES_EN_GB.workflow.activities,
            SKILL_NAME: 'Activity Manager',
            WELCOME_MESSAGE: "Welcome to %s. you begin by asking for the activities assigned to you, what\'s the activity for today? ... Now, what can I help you with.",
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - activity for %s.',
            HELP_MESSAGE: "You can ask questions such as, what\'s the activity, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMPT: "You can say things like, what\'s the activity, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            ACTIVITY_REPEAT_MESSAGE: 'Try saying repeat.',
            ACTIVITY_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know ",
            ACTIVITY_NOT_FOUND_FOR_VALUE: 'There is not an activity for activity number %s. ',
            ACTIVITY_NOT_FOUND_WITHOUT_VALUE: 'you need to specify a valid activity number with your request',
            ACTIVITY_NOT_FOUND_REPROMPT: 'What else can I help with?',
            COMMAND_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know that command please can you repeat or say repeat, or say Cancel to restart.",
        },
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

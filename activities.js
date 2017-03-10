/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
module.exports = {
  ACTIVITIES_EN_GB: 
  {
  "workflow": {
    "summary": "you are required to perform the following activities.",
    "activities": [
      {
        "activity": {
			"key" : "1",
			"summary": "You are required to select a suitable engine architecture for a new aircraft design.",
			"detail": "In order to perform this activity, you need to review the requirements. To do this, say 'show me the requirements.'",
			"preconditions": [
				{
				"command": "select_architecture",
				"values": [1,2]
				}
			],
			"requirements": [
				{
					"key": "1", 
					"summary" : "Initial Cost requirement less the £20,000,000",
					"detail": "optimise for Cost"
				},
				{
					"key": "2", 
					"summary" : "Thrust SHALL be at least 100,000 kilo Newtons ",
					"detail": "optimise for Thrust"
				},
				{
					"key": "3", 
					"summary" : "The Specific Fuel Efficiency SHALL be greater than 0.65",
					"detail": "optimise for SFC"
				},
				{
					"key": "4", 
					"summary" : "The Operational cost  SHALL be less than £200,000 per engine per year",
					"detail": "optimise for Operational Cost"
				},
				{
					"key": "5", 
					"summary" : "The total gross engine weight SHALL be less than 5 tonnes",
					"detail": "optimise for Weight"
				}
			]
        }
      },
      {
        "activity": {
			"key" :"20",
          	"summary": "You are required to perform an optimisation routine on a HP turbine disk."
        }
      },
      {
        "activity": {
			"key" :"30",
          	"summary": "You are required to write a paper on Multi-disciplinary optimisation."
        }
      }
    ]
  }
}
};

<p align="center">
  <a href="https://decentraland.org">
    <img alt="Decentraland" src="https://decentraland.org/images/logo.png" width="60" />
  </a>
</p>
<h1 align="center">
  Quests Scene - SDK7
</h1>

This is a Decentraland Scene example using SDK7 and the [Quests Client](https://github.com/decentraland/quests-client 'Quests Client repository') where you can see how it's used to show some information about the current Quests or to send events based on what's happening on the Explorer session.

## Start

Use preview mode to test the feature:

```console
$ npm run start
```

## Quests Client in action

In this example you will see:

- **Quests Client creation**: user is authenticated based on the signed headers provided by the SDK7

- **Quests tracking UI**:
  - Simple Quest Tracker UI that shows current state for each active Quest
  - Listen to Quest events to update the UI
- **Quests Progress**:
  - Systems reading the World state
  - Check when the user arrived to a parcel and send the Position event
  - Check when the user emotes and send the event

**Note**: _Quests client_ will check if the event to send applies to any active quest before sending it to the server.


## Quest Definition

```json
{
    "name": "Prepare for Battle",
    "image_url": "https://raw.githubusercontent.com/decentraland/sdk7-goerli-plaza/main/Gnark/images/scene-thumbnail.png",
    "definition": {
        "steps": [
          {
            "id": "prepare-for",
            "description": "Prepare for the Battle",
            "tasks": [
              {
                "id": "pick-up-armor",
                "description": "Pick up the armor",
                "actionItems": [
                  {
                    "type": "CUSTOM",
                    "parameters": {
                      "kind": "PickUp",
                      "id": "armor"
                    }
                  }
                ]
              },
              {
                "id": "pick-up-ammo",
                "description": "Pick up the ammo",
                "actionItems": [
                  {
                    "type": "CUSTOM",
                    "parameters": {
                      "kind": "PickUp",
                      "id": "ammo"
                    }
                  }
                ]
              },
              {
                "id": "pick-up-medikit",
                "description": "Pick up the medikit",
                "actionItems": [
                  {
                    "type": "CUSTOM",
                    "parameters": {
                      "kind": "PickUp",
                      "id": "medikit"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "go-to-zone",
            "description": "Go to the Battle Zone",
            "tasks": [
              {
                "id": "go-to-battle-zone",
                "description": "Go to the Battle Zone",
                "actionItems": [
                  {
                    "type": "LOCATION",
                    "parameters": {
                      "y": "1",
                      "x": "1"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "connections": [
          {
            "stepFrom": "prepare-for",
            "stepTo": "go-to-zone"
          }
        ]
    }
}
```

curl -X POST --data-urlencode "payload={\"channel\": \"$1\", \"username\": \"anna\", \"text\": \"$2\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/$SLACK_TOKEN
    
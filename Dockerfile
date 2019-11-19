FROM node:10-slim

LABEL com.github.actions.name="ESLint checks"
LABEL com.github.actions.description="Lint your code with eslint in parallel to your builds"
LABEL com.github.actions.icon="code"
LABEL com.github.actions.color="yellow"

LABEL maintainer="Philipp Uhl <git@ph-uhl.com>"

RUN apt-get update && apt-get install -y git 
  

COPY lib /action/lib
ENTRYPOINT ["/action/lib/entrypoint.sh"]

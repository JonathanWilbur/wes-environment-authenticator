FROM node:11.7.0-alpine
LABEL author "Jonathan M. Wilbur <jonathan@wilbur.space>"
RUN mkdir -p /srv/environment-authenticator
WORKDIR /srv/environment-authenticator
COPY . /srv/environment-authenticator/
RUN chmod +x /srv/environment-authenticator/entrypoint.sh
ENTRYPOINT [ "/srv/environment-authenticator/entrypoint.sh" ]
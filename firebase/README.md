# team16-firebase

## Setup

```shell
npm install -g firebase-tools
firebase login
```

## Testing

### Functions

Go [here](https://console.cloud.google.com/iam-admin/serviceaccounts/details/109361841528024277589/keys?authuser=0&project=team16-441820&supportedpurview=project)
and create a new key.

Download the key and move it to `functions/service-account-key.json`.

Create `functions/.env` with this content, replacing the values for `USERNAME` and `PASSWORD` for
your UCSB credentials:

```dotenv
USERNAME="Put your UCSB Net ID here"
PASSWORD="Put your UCSB Password here"
```

Then, run these commands:

```shell
cd functions
npm install
npm test
```

You might need to answer Duo prompts on your phone.

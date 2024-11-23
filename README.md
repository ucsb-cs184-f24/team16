# team06

A Calendar app that displays the course and assignment schedules for UCSB students.
The course schedule would be from UCSB, and the assignment schedules would be from Canvas.

## Tech Stack

React Native (iOS and Android)

## User Roles

- Student checking their course and assignment schedules

## Roles and Permissions

Students would be able to view their calendar in the app.
Maybe allow creating custom events in the calendar or export the calendar.

# Installing

There are two ways to install the app: using the [Releases](https://github.com/ucsb-cs184-f24/team16/releases) tab or building it from the source code.

## Using the Releases tab

In the [Releases](https://github.com/ucsb-cs184-f24/team16/releases) tab, you will find the source code in `.zip` and in `.tar.gz`, as well as the
`.apk` and `.ipa` files.

### Android

If you are using Android, download the `.apk` file from the latest release on your device.
Make sure you have allowed installing apps from unknown sources. Then, open the `.apk` file and install.

### iOS

If you are using iOS, things much more complicated. There are multiple ways to do this, some requiring
jailbreak, which is a huge security issue, but I will only be naming two methods that sideloads the
app, which is much safer than jailbreak.

Note: Use USB connection if you are on the UCSB network.

Also, if you are on Windows, download and install the web version of iTunes and iCloud, as mentioned
in [Altstore's guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows#before-installing-altstore) and [Sideloadly's guide](https://sideloadly.io/#:~:text=Important%20Windows%20Task).

#### Altstore

Download and install [Altstore](https://altstore.io/) Server on your computer, which has both a [macOS guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-macos)
and a [Windows guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows).

Then, download the `.ipa` file on your device.

Next, connect your device to your computer with a USB cable.

Finally, either locate the file in the Files app and use the share feature to open it with Altstore,
or use the plus icon in the top left corner of My Apps tab of the Altstore app.

If you don't want to go to the trouble of manually downloading the `.ipa` file, go to the Sources
tab of the Altstore app and add this source:

```
https://raw.githubusercontent.com/ucsb-cs184-f24/team16/refs/heads/main/altstore.json
```

Then, you can install the app directly from the team16 source.

#### Sideloadly

Download and install [Sideloadly](https://sideloadly.io/#download) on your computer. You can check the [installation video](https://www.youtube.com/watch?v=vqTsavQc3lQ)
linked on the site.  The installation steps is similar as on macOS, but without the iCloud and iTunes setup.

Then, download the `.ipa` file on your computer and drag it to Sideloadly's UI.

Next, connect your device to your computer with a USB cable.

Finally, select your device from the dropdown menu and click start.

If you're on an Apple Silicon mac, you can even install the app on your computer by selecting Apple Silicon.

## Installing from source

If you're installing from source, clone the repository.

If you want a development build, you can follow [this guide](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build). Don't use Expo Go since this app
requires custom binaries that are not in the Expo Go app.

If you want a production build, you can follow [this guide](https://docs.expo.dev/build/internal-distribution/). This is much more complicated than
a development build.

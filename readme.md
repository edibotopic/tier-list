# TierList

This is a small web app for making **tier lists**, with support for all major image formats.

## Problem

Content creators often make ranking videos where they divide items (e.g., games, software, artists) to be ranked into tiers (e.g., great, good, bad).

When making these videos software designed for digital drawing and image processing (e.g., GIMP, Krita) are often used. While these are excellent pieces of software, they are needlessly powerful given the simplicity of the task.

The (necessarily) complex GUIs of these programs create visual noise. In addition, the creator needs to manually resize images added to the program.

## Solution

TierList is a minimal application with three pre-defined tiers. Images (`png`, `jpeg`, `gif`) can be dragged onto the page individually or in groups. Images will be aligned neatly at the base of the tier list. Each image will be automatically adjusted to a sensible, constant size, which can be adjusted afterwards as needed.

## Usage

To use the app you can either access the web version or download a local copy. The local copy is a single `index.html` file that will open your default browser when accessed.

Any image can be dragged by its tab bar or resized by dragging at a corner. Groups of images will be arranged left-right at the bottom of the page. Clicking on a tier box will allow you to change the default text (e.g., 'good' -> 'fair').

Three default themes are provided (light, dark, gruv, minimal). To change theme simply select one of the circles at the bottom right of the screen.

*Note: currently, adding new tiers to the initial three creates coloured boxes that don't work well with the minimal themes.*

### Use-case (OBS)

TO COMPLETE

### Limitations

- App has not been designed with mobile in mind, as I don't foresee that being a common workflow

~~Only three tiers are provided by default, but I hope to add the option to add/remove tiers in future~~

- There is no option to remove existing tiers
- There is not much flexibility for resizing the page, but on a regular-large screen there should be plenty real estate for adding/resizing images
- There is currently no method to remove images that have been added (this is planned)
- Resizing the window after images have been arranged can mess up the arrangement (current fix: don't resize the window after you have started 😆)
- Long/wordy/comical tier names will likely not wrap well (current fix: keep 'em short)

## Roadmap

- [x] Option to add tiers
- [ ] Option to remove tiers
- [ ] Dynamically change tab colour depending on tier
- [ ] Support for other media (videos, audio)
- [ ] More flexibility for window resizing
- [ ] Collaborative editing (unlikely!)
- [ ] Guidance on saving tier lists (for now: screenshot; consider localstorage?)

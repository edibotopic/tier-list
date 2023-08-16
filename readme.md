# TierList

This is a small web app for making **tier lists**, with support for all major image formats.

## Problem

Content creators often make ranking videos where they divide items (e.g., games, software, artists) into tiers (e.g., great, good, bad).

When making these videos software designed for digital drawing and image processing (e.g., GIMP, Krita) is often used. While these are excellent pieces of software, they are needlessly powerful given the simplicity of the task.

The complex GUIs of these programs create visual noise. In addition, the creator needs to manually resize images added to the program.

There are some dedicated tier list apps but they are often bloated,
with social media tools, payment options and galleries.

## Solution

TierList is a minimal application with standard pre-defined tiers (S-F). Images (`png`, `jpeg`, `gif`) can be dragged onto the page individually or in groups. Images will then be aligned neatly at the base of the tier list. Each image will be automatically adjusted to a sensible, constant size, which can be further readjusted as needed.

## Usage

Any image can be moved by clicking and dragging its tab bar or resized by dragging at a corner. Groups of images will be arranged left-right at the bottom of the page. Clicking on a tier box will allow you to change the default text (e.g., 'good' -> 'fair').

Three default themes are provided (gruvbox (default), light, minimal). To change theme simply select one of the circles at the bottom right of the screen.

### Limitations

- App has not been designed with mobile in mind, as I don't foresee that being a common workflow
- There is no option to add/remove tiers
- There is not much flexibility for resizing the page, but on a regular-large screen there should be plenty real estate
- There is currently no method to remove images that have been added
- Resizing the window after images have been arranged will mess up the arrangement (current fix: don't resize the window after you have started 😆)
- Long/wordy/comical tier names will not fit well (current fix: keep 'em short)

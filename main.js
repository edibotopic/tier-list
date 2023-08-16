const setTheme = (theme) => (document.documentElement.className = theme)

let body = document.getElementById('body')
let moveable = 0
let canMove = () => {
    moveable = 1
}
let cannotMove = () => {
    moveable = 0
}

window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => {
    e.preventDefault()
        ;[...e.dataTransfer.items].forEach((item) => {
            if (
                item.type === 'image/png' ||
                item.type === 'image/jpeg' ||
                item.type === 'image/gif' ||
                item.type === 'image/webp' ||
                item.type === 'image/svg+xml'
            ) {
                const file = item.getAsFile()
                const url = URL.createObjectURL(file)
                const resize = document.createElement('div')
                const tab = document.createElement('div')
                const img = document.createElement('img')
                img.src = url
                img.onload = () => {
                    this.ratio = img.width / img.height
                }

                body.appendChild(resize)
                resize.setAttribute('id', 'resize')
                resize.appendChild(tab)
                tab.setAttribute('class', 'tab')
                tab.setAttribute('onmouseenter', 'canMove()')
                tab.setAttribute('onmouseleave', 'cannotMove()')
                resize.appendChild(img)
                resize.setAttribute('draggable', 'true')

                resize.onmousedown = (e) => {
                    if (moveable === 1) {
                        console.log(moveable)
                        let shiftX = e.clientX - resize.getBoundingClientRect().left
                        let shiftY = e.clientY - resize.getBoundingClientRect().top

                        resize.style.position = 'absolute'
                        resize.style.zIndex = 1000

                        function moveAt(pageX, pageY) {
                            resize.style.left = pageX - shiftX + 'px'
                            resize.style.top = pageY - shiftY + 'px'
                        }

                        moveAt(e.pageX, e.pageY)

                        let onMouseMove = (e) => {
                            moveAt(e.pageX, e.pageY)
                        }

                        document.addEventListener('mousemove', onMouseMove)

                        resize.onmouseup = () => {
                            document.removeEventListener('mousemove', onMouseMove)
                            resize.onmouseup = null
                        }

                        resize.ondragstart = function() {
                            return false
                        }
                    } else if (moveable === 0) {
                        console.log('use the tab')
                        console.log(moveable)
                    }
                }
            }
        })
})

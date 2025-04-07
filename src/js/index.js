class XYFUTILS {
  constructor() {
    // super()
  }
  // 获取设备像素比例，分辨率
  getPixelRatio() {
    return window.devicePixelRatio || 1
  }
  // 全部转小写
  toLowercaseSeparator(key) {
    return key.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
  // 将对象已style的形式拼接
  getStyleStr(style) {
    return Object.keys(style)
      .map((key) => `${this.toLowercaseSeparator(key)}: ${style[key]};`)
      .join(' ')
  }
  // 绘制水印
  createwatermark(params = {}) {
    const {
      content = '试用水印',
      gap = [100, 100],
      rotate = -22,
      image = null,
      fontSize = 16,
      width = 120,
      height = 64,
      color = '#00000059',
      fontStyle = 'normal',
      fontWeight = 'normal',
      fontFamily = 'sans-serif',
      FontGap = 3,
      BaseSize = 2,
    } = params
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const gapX = gap[0] || 100
      const gapY = gap[1] || 100
      const ratio = this.getPixelRatio()
      if (ctx) {
        const getMarkSize = (ctx) => {
          let defaultWidth = 120
          let defaultHeight = 64
          if (!image && ctx.measureText) {
            ctx.font = `${Number(fontSize)}px ${fontFamily}`
            const contents = Array.isArray(content) ? content : [content]
            const widths = contents.map((item) => ctx.measureText(item).width)
            defaultWidth = Math.ceil(Math.max(...widths))
            defaultHeight = Number(fontSize) * contents.length + (contents.length - 1) * FontGap
          }
          return [width !== null && width !== void 0 ? width : defaultWidth, height !== null && height !== void 0 ? height : defaultHeight]
        }

        const [markWidth, markHeight] = getMarkSize(ctx)
        const canvasWidth = (gapX + markWidth) * ratio
        const canvasHeight = (gapY + markHeight) * ratio
        canvas.setAttribute('width', `${canvasWidth * BaseSize}px`)
        canvas.setAttribute('height', `${canvasHeight * BaseSize}px`)
        const drawX = (gapX * ratio) / 2
        const drawY = (gapY * ratio) / 2
        const drawWidth = markWidth * ratio
        const drawHeight = markHeight * ratio
        const rotateX = (drawWidth + gapX * ratio) / 2
        const rotateY = (drawHeight + gapY * ratio) / 2
        /** Alternate drawing parameters */
        const alternateDrawX = drawX + canvasWidth
        const alternateDrawY = drawY + canvasHeight
        const alternateRotateX = rotateX + canvasWidth
        const alternateRotateY = rotateY + canvasHeight
        ctx.save()
        const rotateWatermark = (ctx, rotateX, rotateY, rotate) => {
          ctx.translate(rotateX, rotateY)
          ctx.rotate((Math.PI / 180) * Number(rotate))
          ctx.translate(-rotateX, -rotateY)
        }

        rotateWatermark(ctx, rotateX, rotateY, rotate)
        const markStyle = ({ positionLeft = 0, positionTop = 0 } = {}) => {
          const markStyle = {
            zIndex: 999,
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            backgroundRepeat: 'repeat',
          }
          /** Calculate the style of the offset */
          if (positionLeft > 0) {
            markStyle.left = `${positionLeft}px`
            markStyle.width = `calc(100% - ${positionLeft}px)`
            positionLeft = 0
          }
          if (positionTop > 0) {
            markStyle.top = `${positionTop}px`
            markStyle.height = `calc(100% - ${positionTop}px)`
            positionTop = 0
          }
          markStyle.backgroundPosition = `${positionLeft}px ${positionTop}px`
          return markStyle
        }
        const appendWatermark = (base64Url, markWidth) => {
          let watermark = document.getElementById('xyf-watermark')
          if (!watermark) {
            watermark = document.createElement('div')
            watermark.setAttribute('id', 'xyf-watermark')
            document.body.appendChild(watermark)
          }
          watermark.setAttribute(
            'style',
            this.getStyleStr(
              Object.assign({}, markStyle(), {
                backgroundImage: `url('${base64Url}')`,
                backgroundSize: `${(gapX + markWidth) * BaseSize}px`,
              })
            )
          )
          resolve(base64Url)
        }
        if (image) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.referrerPolicy = 'no-referrer'
          img.src = image
          img.onload = () => {
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
            /** Draw interleaved pictures after rotation */
            ctx.restore()
            rotateWatermark(ctx, alternateRotateX, alternateRotateY, rotate)
            ctx.drawImage(img, alternateDrawX, alternateDrawY, drawWidth, drawHeight)
            appendWatermark(canvas.toDataURL(), markWidth)
          }
        } else {
          const fillTexts = (ctx, drawX, drawY, drawWidth, drawHeight) => {
            const mergedFontSize = Number(fontSize) * ratio
            ctx.font = `${fontStyle} normal ${fontWeight} ${mergedFontSize}px/${drawHeight}px ${fontFamily}`
            ctx.fillStyle = color
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.translate(drawWidth / 2, 0)
            const contents = Array.isArray(content) ? content : [content]
            contents === null || contents === void 0
              ? void 0
              : contents.forEach((item, index) => {
                  ctx.fillText(item !== null && item !== void 0 ? item : '', drawX, drawY + index * (mergedFontSize + FontGap * ratio))
                })
          }
          fillTexts(ctx, drawX, drawY, drawWidth, drawHeight)
          /** Fill the interleaved text after rotation */
          ctx.restore()
          rotateWatermark(ctx, alternateRotateX, alternateRotateY, rotate)
          fillTexts(ctx, alternateDrawX, alternateDrawY, drawWidth, drawHeight)
          appendWatermark(canvas.toDataURL(), markWidth)
        }
      } else {
        console.error('浏览器不支持水印')
        reject()
      }
    })
  }
  // 获取星期几这样的日期
  getWeekDay() {
    const d = new Date()
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const currentDay = weekdays[d.getDay()]
    return currentDay
  }
  // 移除传入链接中的某一个参数并返回移除后的链接
  removeParameterFromUrl(url, parameterToRemove) {
    let urlObj = new URL(url)
    urlObj.searchParams.delete(parameterToRemove)
    return urlObj.toString()
  }
}
const xyf_utils = new XYFUTILS()
export default {
  getPixelRatio: () => {
    xyf_utils.getPixelRatio()
  },
  toLowercaseSeparator: (params) => {
    xyf_utils.toLowercaseSeparator(params)
  },
  getStyleStr: (styleParams) => {
    xyf_utils.getStyleStr(styleParams)
  },
  createwatermark: (params) => {
    xyf_utils.createwatermark(params)
  },
  getWeekDay: () => {
    xyf_utils.getWeekDay()
  },
  removeParameterFromUrl: (url, parameterToRemove) => {
    xyf_utils.removeParameterFromUrl(url, parameterToRemove)
  },
}

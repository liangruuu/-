/**
 * 加工处理最终回复用户消息的模板
 */
module.exports = options => {
  let replyMessage =
    `
    <xml>
    <ToUserName><![CDATA[${options.ToUserName}]]></ToUserName>
    <FromUserName><![CDATA[${options.FromUserName}]]></FromUserName>
    <CreateTime>${options.creaeTime}</CreateTime>
    <MsgType><![CDATA[${options.MsgType}]]></MsgType>
  `
  if (options.MsgType === 'text') {
    replyMessage += `<Content><![CDATA[${options.context}]]></Content>`
  } else if (options.MsgType === 'image') {
    replyMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`
  } else if (options.MsgType === 'voice') {
    replyMessage += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`
  } else if (options.MsgType === 'video') {
    /**
     * 1. 开发者上传媒体资源到微信服务器，微信服务器生成对应的mediaID发送给用户 
     * 2. 用户通过mediaID，访问对应的媒体资源
     */
    replyMessage += `
      <Video>
        <MediaId><![CDATA[${options.mediaId}]]></MediaId>
        <Title><![CDATA[${options.title}]]></Title>
        <Description><![CDATA[${options.description}]]></Description>
      </Video>`
  } else if (options.MsgType === 'music') {
    replyMessage += `
      <Music>
        <Title><![CDATA[${options.title}]]></Title>
        <Description><![CDATA[${options.description}]]></Description>
        <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
        <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
        <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
      </Music>`
  } else if (options.MsgType === 'news') {
    /**
     * options.content = [{...},{...},{...}]
     * 
     */
    replyMessage += `<ArticleCount>${options.content.length}</ArticleCount><Articles>`
    options.content.forEach(item => {
      replyMessage += `
          <item>
            <Title><![CDATA[${item.title}]]></Title>
            <Description><![CDATA[${item.description}]]></Description>
            <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
            <Url><![CDATA[${item.url}]]></Url>
          </item>`
    })
    replyMessage += `</Articles>`
  }
  replyMessage += '</xml>'
  // 最终返回给用户的xml数据
  return replyMessage
}
$(function(){

	var movies = [];
	//自动切换电影列表
	var timer = setInterval(autoChange, 3000);

	//监听切换按钮的点击
	$('#screening .prev-btn').on('click',function(){
		clearInterval(timer);
		buffer($('#slide_content').get(0), 700, false, -4200);
		timer = setInterval(autoChange, 3000);
	});
	$('#screening .next-btn').on('click',function(){
		clearInterval(timer);
		buffer($('#slide_content').get(0), 700, true, -4200);
		timer = setInterval(autoChange, 3000);
	});

	//监听鼠标移入/移出，关闭/开启定时器
	$('body').on('mouseover', '.slide-item', function(event){
		clearInterval(timer);
	});
	$('body').on('mouseleave', '.slide-item', function(event){
		timer = setInterval(autoChange, 3000);
	});

	//异步请求豆瓣电影信息
	$.ajax(
		'https://api.douban.com/v2/movie/in_theaters?start=0&count=35',{
			type: 'get',
			dataType: 'jsonp',
		}
	)
	.done(function(items) {
		for(var idx in items.subjects){
			var subject = items.subjects[idx];
			var title = subject.title;
			if(title.length){
				title = title.substring(0, 6) + '...';
			}
			var temp = {
				title: title,
				coverageUrl: subject.images.large,
				star: subject.rating.stars,
				average: subject.rating.average,
				movieid: subject.id
			}
			movies.push(temp);
		}
		console.log(movies);
		//创建电影条目
		createMovieItem(movies);

		//设置总页数
		$('#screening .slide-max').get(0).innerText = parseInt(Math.ceil(movies.length/5));
	})
	.fail(function() {
		console.log("error");
	})
})
//创建电影条目
function createMovieItem(movielist){
	for(var i=0; i< movielist.length; i++){
		//取出父标签的文本
		var str = $('#slide_content').get(0).innerHTML;
		//处理星星
		var starPic = setStar(movielist[i].star);
		//创建子标签
		var strHtml = "<li class='slide-item'>"+
							"<ul>"+
								"<li class='poster'><a href='https://movie.douban.com/subject/"+movielist[i].movieid+"/?from=showing'><img src='"+movielist[i].coverageUrl+"' alt=''></a></li>"+
								"<li class='title'><a href='https://movie.douban.com/subject/"+movielist[i].movieid+"/?from=showing'>"+movielist[i].title+"</a></li>"+
								"<li class='rating'>"+
									"<span class='rating-star' style='width: 55px;height: 11px;background:url(https://img3.doubanio.com/f/shire/b8f4c3672ef81106701071831e22422a745d3b74/pics/rating_icons/ic_rating_s.png) no-repeat 0 " + starPic + "px;'></span>"+
									"<span class='subject-rate'>"+movielist[i].average+"</span>"+
								"</li>"+
								"<li class='ticket-btn'><span><a href=''>选座购票</a></span></li>"+
							"</ul>"+
						"</li>";
		//拼接
		str += strHtml;
		$('#slide_content').get(0).innerHTML = str;
	}
}

//切换列表缓动动画
function buffer(obj, moveRange, flag, minLeft){
	beginLeft = parseInt(obj.style.left);
	if(flag){//下一页
		endLeft = beginLeft - moveRange;
		//切换页码
		$('#screening .slide-index').get(0).innerText = parseInt($('#screening .slide-index').get(0).innerText) + 1;
		//判断是否最后一页
		if(endLeft < minLeft){
			endLeft = 0;
			$('#screening .slide-index').get(0).innerText = 1;
		}
	}else{//上一页
		endLeft = beginLeft + moveRange;
		//切换页码
		$('#screening .slide-index').get(0).innerText = parseInt($('#screening .slide-index').get(0).innerText) - 1;
		//判断是否第一页
		if(endLeft > 0){
			endLeft = minLeft;
			$('#screening .slide-index').get(0).innerText = 7;
		}
	}
	obj.timer = setInterval(function(){
		//获取当前列表新的left值并求出步长
		newLeft = parseInt(obj.style.left);
		speed = (endLeft - newLeft) * 0.2;

		//判断是否向上取整
		speed = (endLeft > newLeft) ? Math.ceil(speed) : Math.floor(speed);

		//开始切换
		obj.style.left = newLeft + speed + 'px';
	},20)
}

//自动切换列表
function autoChange(){
	buffer($('#slide_content').get(0), 700, true, -4200);
}

//星星处理
function setStar(star){
	/*
	0 0 ———— 5星
	0 -11px ———— 4.5星
	0 -22px ———— 4星
	...
	0 -110px ———— 0星
	 */
	return positionY = parseInt((50 - parseInt(star)) / 5 * -11);
}
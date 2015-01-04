console.log('loaded');
$(function(){
  var appendToList = function(blocks){
    var list = [];
    var content,block;
    for(var i in blocks){
      block = blocks[i];
      content = '<span data-block="'+block+'" >X </span><a href="/blocks/'+block+'"> '+block+'</a>';
      list.push($('<li>',{html: content }))
    }
    $('.block-list').append(list);
  };

  $.get('/blocks', appendToList);

  $('.block-list').on('click', 'span[data-block]', function(event){
    var target = $(this);
    $.ajax({
      type: 'DELETE',
      url: '/blocks/'+target.data('block')
    }).done(function(blockName){
      target.parents('li').remove();
    });
  });

  $('form').on('submit', function(event){
    event.preventDefault();
    var $form = $(this);
    var blockData = $form.serialize();

    $.ajax({
      type: 'POST',
      url: '/blocks',
      data: blockData
    }).done(function(blockName){
      console.log(blockName);
      appendToList([blockName]);
      $form.trigger('reset');
    });
  });
});

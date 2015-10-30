var Lot = window.Lot || {}; (function(win, ns) {
    var rock_pd = 50,
        rock_delay = 600,
        lucker_group1 = [],
        lucker_group2 = [],
        lg1_html, lg2_html;

    var gen = {
        randInt: function(max, min){
            max = max || 0;
            min = min || 0;
            return parseInt(Math.random() * (max - min + 1 ) + min);
        }
    };

    var lottery = function(min, max, num, except) {
        var lucker = [], hash = {};
        except = except || [];
        for (var i = 0, n = except.length; i < n; i++) {
            hash[except[i]] = true;
        }

        while (lucker.length < num) {
            var r = gen.randInt(max, min);
            if (!hash[r]) {
                lucker.push(r);
                hash[r] = true;
            }
        }
        return lucker;
    };

    var FirstPrize = new Class({

        setup: function(min, max, num) {
            this.min = min;
            this.max = max;
            this.num = num;
        },

        start: function() {
            this.lucker = lottery(this.min, this.max, this.num);
            lucker_group1 = this.lucker;
            lg1_html = '<h2>一等奖</h2><p>' + lucker_group1.join(', ') + '</p>';

            this.idx = 0;
            //console.log(lucker_group1);

            this.cnt = $('no1');
            this.cnt.empty();

            this.rock();
        },

        rock: function(timeout) {
            var idx = this.idx, box = this.createInput(idx);
            this.box = box;

            timeout = timeout || 0;

            this.timer = (function() { 
                var r = gen.randInt(this.max, this.min);
                dp = poll_data[r];
                box.set('value', dp);
            }).periodical(rock_pd, this);

            if (timeout > 0) {
                this.rockNext.delay(timeout, this);
            }
        },

        rockNext: function() {
            this.stop();
            this.idx ++;
            if (this.idx < this.num) this.rock(rock_delay);
        },

        stop: function() {
            if(this.timer) $clear(this.timer);
            if(this.box) this.box.set('value', poll_data[this.lucker[this.idx]]);
        },

        createInput: function(idx) {
            var cnt = this.cnt,
                box_id = 'FirstPrize_' + idx,
                box = new Element('input', {
                    id: box_id,
                    name: box_id
                });
            box.inject(cnt);
            return box;
        }
    });

    var SecondPrize = new Class({
        setup: function(min, max, num, group, all) {
            this.min = min;
            this.max = max;
            this.num = num;
            this.group = group;
            this.all = all;
        },

        start: function() {
            lucker_group2 = [];
            var exceptL1 = lucker_group1.length,
                group_num = Math.floor(this.num / this.group),
                group_max = Math.floor((this.all - exceptL1) / this.group);
            lg2_html = '<h2>二等奖</h2>';

            if (isNaN(group_num)) alert('请先抽取一等奖~');
            for (var i = 0, n = this.group; i < n; i++) {
                var gmin = i * group_max + this.min,
                    gmax = (i+1) * group_max + this.min - group_num,
                    r = gen.randInt(gmax, gmin),
                    gend = r + group_num - 1;
                // console.log('第 '+ i + ' 组: 从 ' + r + ' 到 ' + gend);
                // lg2_html += '<p>第 '+ i + ' 组: 从 ' + r + ' 到 ' + gend + '</p>';
                lg2_html += poll_data[r];
                for (var j = r, k = gend; j <= k; j++) {
                    if (lucker_group1.indexOf(j) == -1)
                        lucker_group2.push(j);
                }
            }
            var sp_length = this.num - lucker_group2.length,
                except = [].combine(lucker_group1).combine(lucker_group2);
                special = lottery(this.min, this.max, sp_length, except);

            // console.log(lucker_group2.length, lucker_group2, special);
            // console.log('特别号码：' + special.join(', '));
            // lg2_html += '<p>特别号码：' + special.join(', ') + '</p>';
            for (var i = 0, n = special.length; i < n; i++) {
                var sp = special[i];
                lg2_html += poll_data[sp];
            }

            $('no1').setStyle('display', 'none');
            $('no2').set('html', lg2_html);
        }
    });

    win.addEvent('domready', function() {
        var min, max, 
            all_num,
            l1_num,
            l2_num,
            l1 = new FirstPrize(),
            l2 = new SecondPrize();

        $('max').set('value', poll_data.length);

        function readConfig() {
            min = $('min').get('value') * 1;
            max = $('max').get('value') * 1;
            all_num = max - min + 1;

            l1_num = $('l1_num').get('value') * 1;
            l2_num = $('l2_num').get('value') * 1;
            l2_group = $('l2_group').get('value') * 1;
            // rock_pd = $('rock_pd').get('value') * 1;
            // rock_delay = $('rock_pd').get('value') * 1;
        }

        $('l1_start').addEvent('click', function() {
            l1.stop();
            readConfig();
            l1.setup(min, max, l1_num);
            l1.start();
            return false;
        });
        $('l1_stop').addEvent('click', function() {
            l1.rockNext();
            return false;
        });

        $('l2_start').addEvent('click', function() {
            l2.setup(min, max, l2_num, l2_group, all_num);
            l2.start();
            return false;
        });

        $('l_info').addEvent('click', function() {
            $('no1').setStyle('display', '');
            return false;
        });

    });

})(window, Lot);

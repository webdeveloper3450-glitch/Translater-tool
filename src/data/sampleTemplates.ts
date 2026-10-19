export interface SampleTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'evisa-portal-php',
    name: 'Indian e-Visa Portal (PHP + Schema FAQ)',
    description: 'Production PHP template with preamble, FAQPage Schema, airports grid, and forms',
    html: `<?php include('includes/db-config.php');
include('includes/fun_page.php');
$lastUpdated = date("F Y", filemtime(__FILE__));
// Convert English month name to Arabic
$months_ar = [
    'January' => 'يناير',
    'February' => 'فبراير',
    'March' => 'مارس',
    'April' => 'أبريل',
    'May' => 'مايو',
    'June' => 'يونيو',
    'July' => 'يوليو',
    'August' => 'أغسطس',
    'September' => 'سبتمبر',
    'October' => 'أكتوبر',
    'November' => 'نوفمبر',
    'December' => 'ديسمبر'
];
$lastUpdated_ar = str_replace(array_keys($months_ar), array_values($months_ar), $lastUpdated);
$page = 'evisa_eligible_cn';
?>
<!DOCTYPE html>
<html lang="ar">
<head>
    <?php include('includes/head.php'); ?>
    <title>دليل الأهلية للحصول على تأشيرة الهند الإلكترونية | تحقق من الدول المؤهلة</title>
    <meta name="description" content="تحقق من أهلية تأشيرة الهند الإلكترونية لدولتك. تعرف على رسوم الطلب والقواعد للمزدوجي الجنسية وكيفية التقديم." />
    <link rel="preload" as="style" href="/css/cn_flag.css?2">
    <link rel="stylesheet" href="/css/cn_flag.css?2">
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@graph": [{
                    "@type": "FAQPage",
                    "mainEntity": [{
                            "@type": "Question",
                            "name": "القواعد العامة للأهلية بما يتجاوز الجنسية",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "<ul><li><strong>صلاحية جواز السفر:</strong> يجب أن تحمل جواز سفر ساري المفعول بصلاحية لا تقل عن 6 أشهر من تاريخ وصولك المقصود إلى الهند.</li><li><strong>غرض السفر:</strong> يجب أن يتطابق غرض سفرك تماماً مع نوع تأشيرة e-Visa الذي تتقدم به.</li><li><strong>القيود:</strong> عدم جواز العمل المحلي أو الانخراط في عمل للحصول على فوائد مالية.</li><li><strong>عقوبات الإقامة الزائدة:</strong> يجب على المسافرين مغادرة الهند بمجرد انتهاء صلاحية تأشيرة e-Visa الخاصة بهم حيث قد تؤدي الإقامة الزائدة إلى عقوبات قانونية أو غرامات.</li></ul>"
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "أهلية تأشيرة الهند الإلكترونية للمزدوجي الجنسية",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "<ul><li>تحقق من أي جواز سفرك المؤهل لتأشيرة e-Visa واستخدم ذلك الجواز المؤهل فقط.</li><li>إذا كان كلا جوازي السفر مؤهلين لتأشيرة e-Visa، استخدم جواز سفر واحد فقط لتقديم طلب تأشيرة e-Visa وسافر بذلك الجواز المحدد.</li></ul>"
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "أهلية تأشيرة الهند الإلكترونية للأطفال",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "تنطبق قواعد أهلية تأشيرة الهند الإلكترونية على الجميع، بغض النظر عن العمر. فقط تأكد من أن الطفل يحمل جواز سفره الخاص الذي ليس منتهياً أو قريباً من الانتهاء."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "هل تحصل جميع الدول المؤهلة على نفس خيارات تأشيرة e-Visa؟",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "نعم. يمكن جميع المواطنين الأجلة المؤهلين التقديم لأنواع تأشيرة الهند الإلكترونية بناءً على غرض زيارتهم للهند، بما في ذلك تأشيرة e-Tourist Visa (30 يوماً، سنة واحدة، 5 سنوات)، تأشيرة e-Business Visa، تأشيرة e-Conference Visa، تأشيرة e-Medical Visa، تأشيرة e-Medical Attendant Visa، تأشيرة e-Ayush Visa، تأشيرة e-Ayush Attendant Visa، تأشيرة e-Transit Visa، تأشيرة e-Production Investment Visa، تأشيرة e-Mountaineering Visa، تأشيرة e-Film Visa، وتأشيرة e-Miscellaneous Visa."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "كيف يمكنني التقديم على تأشيرة الهند الإلكترونية؟",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "<ol><li><strong>ملء نموذج الطلب:</strong> املأ التفاصيل في نموذج طلب تأشيرة e-Visa تماماً كما تظهر في جواز سفرك والمستندات المطلوبة.</li><li><strong>دفع الرسوم:</strong> ارفع جميع المستندات المطلوبة وادفع رسوم تأشيرة e-Visa باستخدام أحد خيارات الدفع المتاحة.</li><li><strong>استلام تأشيرة e-Visa:</strong> بعد الموافقة، ستتلقى تأشيرة e-Visa عبر البريد الإلكتروني. اطبع نسخة للسفر.</li></ol>"
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "هل تتغير رسوم طلب تأشيرة الهند الإلكترونية حسب الجنسية؟",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "إجمالي رسوم تأشيرة الهند الإلكترونية يعتمد على جنسيتك المختارة، سرعة المعالجة، ونوع تأشيرة e-Visa."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "ماذا يحدث للطلبات غير المؤهلة لتأشيرة e-Visa؟",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "يمكن فقط لمواطني الدول المؤهلة التقديم على تأشيرة e-Visa. إذا كانت جنسيتك ليست في القائمة، لن تتمكن من المتابعة مع طلب تأشيرة الهند الإلكترونية. لذلك، تحقق من أهليتك قبل التقديم."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "هل يمكن أن تتغير قائمة الدول المؤهلة لتأشيرة الهند الإلكترونية؟",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "نعم. قد تتغير قائمة الدول المؤهلة لتأشيرة الهند الإلكترونية بسبب تحديثات في السياسات. يجب على المتقدمين التحقق من أحدث سياسة تأشيرة الهند للتأكد من أن دولتهم مؤهلة لتأشيرة e-Visa، أصبحت معفاة من التأشيرة أو تحتاج إلى التقديم على تأشيرة ملصقة تقليدية عبر السفارة."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "هل يمكنني دخول الهند عبر أي مطار أو ميناء بحري؟",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "لا. يجب على المسافرين دخول الهند فقط عبر 36 مطاراً محدداً و38 ميناءً بحرياً محدداً. يمكن للمتقدمين المغادرة من أي من نقاط تفتيش الهجرة المصرحة المذكورة أعلاه في الهند. إذا وصلت إلى أي ميناء دخول آخر غير مذكور أعلاه، يُطلب من المتقدمين التقديم على تأشيرة هندية تقليدية في أقرب سفارة / قنصلية."
                            }
                        }
                    ]
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [{
                            "@type": "ListItem",
                            "position": 1,
                            "name": "الرئيسية",
                            "item": "<?= $site_url ?>/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "الدول المؤهلة",
                            "item": "<?= $site_url ?>/eligible-country-indian-visa/"
                        }
                    ]
                },
                {
                    "@type": "WebPage",
                    "@id": "<?= $site_url ?>/eligible-country-indian-visa/#webpage",
                    "name": "دليل الأهلية للحصول على تأشيرة الهند الإلكترونية | تحقق من الدول المؤهلة",
                    "description": "تحقق من أهلية تأشيرة الهند الإلكترونية لدولتك. تعرف على رسوم الطلب والقواعد للمزدوجي الجنسية وكيفية التقديم.",
                    "url": "<?= $site_url ?>/eligible-country-indian-visa/",
                    "inLanguage": "ar",
                    "datePublished": "<?= date('Y-m-d') ?>",
                    "dateModified": "<?= date('c') ?>"
                },
                {
                    "@type": "Organization",
                    "name": "تأشيرة الهند",
                    "url": "<?= $site_url ?>",
                    "logo": "<?= $site_url ?>/images/logo.png",
                    "sameAs": [
                        "https://www.facebook.com/emergencyindiavisa/"
                    ]
                }
            ]
        }
    </script>
</head>
<body>
    <div class="wrapper">
        <?php include('includes/static_header.php'); ?>
        <div class="third-sec apply-text">
            <div class="container">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="third-sec-heading text-center">
                            <br />
                            <h1>الدول المؤهلة للحصول على تأشيرة الهند الإلكترونية</h1>
                            <div class="hr_line"></div>
                            <p>يمكن للمسافرين الذين يخططون لزيارة الهند التقديم بسهولة على تأشيرة الهند الإلكترونية، إذا كانت دولتهم مدرجة بين الدول المؤهلة لتأشيرة e-Visa. يمكن إكمال عملية الحصول على تأشيرة e-Visa بالكامل عبر الإنترنت وستتلقى موافقة سفرك عبر البريد الإلكتروني دون زيارة سفارة.</p>
                            <div class="upperbtn">
                                <a href="/apply-visa/" class="main-btn">احصل على تأشيرتك الهندية الإلكترونية</a>
                            </div>
                        </div>
                        <?php
                        include("db-config.php");
                        function str_remove_char($str)
                        {
                            $str = str_replace(' ', '-', $str);
                            $str = str_replace('’', '', $str);
                            $str = str_replace('"', '', $str);
                            $str = str_replace("'", '', $str);
                            $str = str_replace(\`\`, '', $str);
                            $str = str_replace('&', '', $str);
                            $str = str_replace('(', '', $str);
                            $str = str_replace(')', '', $str);
                            $str = str_replace('.', '', $str);
                            $str = str_replace('–', '-', $str);
                            $str = str_replace('---', '-', $str);
                            $str = str_replace('--', '-', $str);
                            $str = strtolower($str);
                            return $str;
                        }
                        $arr = array();
                        $country_arr = array();
                        $arr_url = array();
                        $str = '';
                        $j = 0;
                        $i = 1;
                        $part_1 = '';
                        $part_2 = '';
                        $part_3 = '';
                        $part_4 = '';
                        $sql = "select name, country_code from countries where status ='active' and visa_req_gid!='3' and visa_req_gid!='0' and visa_req_gid!='2'  Order by name";
                        $rss = mysqli_query($conn, $sql);
                        $ttl = mysqli_num_rows($rss);
                        $j = $ttl / 4;
                        while ($row = mysqli_fetch_assoc($rss)) {
                            if ($i <= $j) {
                                $part_1 .= '<li><a href="/apply-evisa-from-' . str_remove_char($row['name']) . '/"><span class="flag flag-' . strtolower($row['country_code']) . '"></span>&nbsp;' . $row['name'] . '</a></li>';
                            }
                            if ($i <= ($j * 2) && $i > $j) {
                                $part_2 .= '<li><a href="/apply-evisa-from-' . str_remove_char($row['name']) . '/"><span class="flag flag-' . strtolower($row['country_code']) . '"></span>&nbsp;' . $row['name'] . '</a></li>';
                            }
                            if ($i <= ($j * 3) && $i > ($j * 2)) {
                                $part_3 .= '<li><a href="/apply-evisa-from-' . str_remove_char($row['name']) . '/"><span class="flag flag-' . strtolower($row['country_code']) . '"></span>&nbsp;' . $row['name'] . '</a></li>';
                            }
                            if ($i > ($j * 3)) {
                                $part_4 .= '<li><a href="/apply-evisa-from-' . str_remove_char($row['name']) . '/"><span class="flag flag-' . strtolower($row['country_code']) . '"></span>&nbsp;' . $row['name'] . '</a></li>';
                            }
                            $i++;
                        }
                        ?>
                        <h2>الدول المؤهلة لتأشيرة الهند الإلكترونية</h2>
                        <p>المواطنون الأجانب الحاملون لجواز سفر ساري المفعول من أي من الدول التالية مؤهلون للتقديم على تأشيرة الهند الإلكترونية.</p>
                        <!-- Country List with Animation -->
                        <div class="div_lst show-less country-list-wrapper collapsed" id="countryListContainer">
                            <div class="country-grid-container">
                                <div class="sitemap-link part_1">
                                    <ul class="li_cls"><?php echo $part_1; ?></ul>
                                </div>
                                <div class="sitemap-link part_2">
                                    <ul class="li_cls"><?php echo $part_2; ?></ul>
                                </div>
                                <div class="sitemap-link part_3">
                                    <ul class="li_cls"><?php echo $part_3; ?></ul>
                                </div>
                                <div class="sitemap-link part_4">
                                    <ul class="li_cls"><?php echo $part_4; ?></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="clear:both"></div>
                </div>
                <!-- See More/Less Button -->
                <div id="mob1" class="row">
                    <div class="col-md-12" style="text-align: center; margin-top: 15px;">
                        <button id="btnSeeMore" class="see-more-btn" onclick="toggleCountryList()" type="button">
                            عرض المزيد <i class="fa fa-angle-down" aria-hidden="true"></i>
                        </button>
                        <button id="btnSeeLess" class="see-more-btn" style="display:none;" onclick="toggleCountryList()" type="button">
                            عرض أقل <i class="fa fa-angle-up" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="visa-stamp-text">
                    <h2>القواعد العامة للأهلية بما يتجاوز الجنسية</h2>
                    <p>بمجرد أن تكتشف أن جنسيتك مؤهلة لتأشيرة الهند الإلكترونية، يجب أيضاً أن تستوفي المتطلبات التالية للتأكد من حصولك على تأشيرة e-Visa معتمدة.&nbsp;</p>
                    <ul class="custom-style">
                        <li><strong>صلاحية جواز السفر: </strong>يجب أن تحمل جواز سفر ساري المفعول بصلاحية لا تقل عن 6 أشهر من تاريخ وصولك المقصود إلى الهند.</li>
                        <li><strong>غرض السفر:</strong> يجب أن يتطابق غرض سفرك تماماً مع نوع تأشيرة e-Visa الذي تتقدم به.</li>
                        <li><strong>القيود: </strong>عدم جواز العمل المحلي أو الانخراط في عمل للحصول على فوائد مالية.</li>
                        <li><strong>عقوبات الإقامة الزائدة: </strong>يجب على المسافرين مغادرة الهند بمجرد انتهاء صلاحية تأشيرة e-Visa الخاصة بهم حيث قد تؤدي الإقامة الزائدة إلى عقوبات قانونية أو غرامات.</li>
                    </ul>
                    <h2>أهلية تأشيرة الهند الإلكترونية للمزدوجي الجنسية</h2>
                    <p>على المسافرين المزدوجي الجنسية أخذ هذه الأمور في الاعتبار:</p>
                    <ul class="custom-style">
                        <li>تحقق من أي جواز سفرك المؤهل لتأشيرة e-Visa واستخدم ذلك الجواز المؤهل فقط.</li>
                        <li>إذا كان كلا جوازي السفر مؤهلين لتأشيرة e-Visa، استخدم جواز سفر واحد فقط لتقديم طلب تأشيرة e-Visa وسافر بذلك الجواز المحدد.</li>
                    </ul>
                    <h2>أهلية تأشيرة الهند الإلكترونية للأطفال</h2>
                    <p>تنطبق قواعد أهلية تأشيرة الهند الإلكترونية على الجميع، بغض النظر عن العمر. فقط تأكد من أن الطفل يحمل جواز سفره الخاص الذي ليس منتهياً أو قريباً من الانتهاء.</p>
                    <h2>هل تحصل جميع الدول المؤهلة على نفس خيارات تأشيرة e-Visa؟</h2>
                    <p>نعم. يمكن جميع المواطنين الأجلة المؤهلين التقديم على أنواع تأشيرة الهند الإلكترونية المذكورة أدناه، بناءً على غرض زيارتهم للهند. اختر الذي يتطابق مع غرض سفرك:</p>
                    <div class="purpose-list">
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Tourist Visa - 30 يوماً</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Tourist Visa - سنة واحدة</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Tourist Visa - 5 سنوات</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Business Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Conference Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Medical Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Medical Attendant Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Ayush Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Ayush Attendant Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Transit Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Production Investment</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Mountaineering Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Film Visa</p>
                        </div>
                        <div class="purpose-item">
                            <p class="purpose-text">تأشيرة e-Miscellaneous Visa</p>
                        </div>
                    </div>
                    <h2>كيف يمكنني التقديم على تأشيرة الهند الإلكترونية؟</h2>
                    <ul class="custom-style">
                        <li><strong>ملء نموذج الطلب: </strong>املأ التفاصيل في نموذج طلب تأشيرة e-Visa تماماً كما تظهر في جواز سفرك والمستندات المطلوبة.</li>
                        <li><strong>دفع الرسوم: </strong>ارفع جميع المستندات المطلوبة وادفع رسوم تأشيرة e-Visa باستخدام أحد خيارات الدفع المتاحة.</li>
                        <li><strong>استلام تأشيرة e-Visa: </strong>بعد الموافقة، ستتلقى تأشيرتك e-Visa عبر البريد الإلكتروني. اطبع نسخة للسفر.</li>
                    </ul>
                    <h2>هل تتغير رسوم طلب تأشيرة الهند الإلكترونية حسب الجنسية؟</h2>
                    <p>إجمالي <a href="/ar/india-visa-fees/"><strong>رسوم تأشيرة الهند الإلكترونية</strong></a> تعتمد على اختيارك:</p>
                    <div class="purpose-grid">
                        <div class="purpose-item">
                            <div class="purpose-icon"><i class="fa fa-users"></i></div>
                            <p class="purpose-text">الجنسية</p>
                        </div>
                        <div class="purpose-item">
                            <div class="purpose-icon"><i class="fa fa-clock-o"></i></div>
                            <p class="purpose-text">سرعة المعالجة</p>
                        </div>
                        <div class="purpose-item">
                            <div class="purpose-icon"><i class="fa fa-calendar-check-o"></i></div>
                            <p class="purpose-text">نوع تأشيرة e-Visa</p>
                        </div>
                    </div>
                    <h2>ماذا يحدث للطلبات غير المؤهلة لتأشيرة e-Visa؟&nbsp;</h2>
                    <p>يمكن فقط لمواطني الدول المؤهلة التقديم على تأشيرة e-Visa. إذا كانت جنسيتك ليست في القائمة، لن تتمكن من المتابعة مع طلب تأشيرة الهند الإلكترونية. لذلك، تحقق من أهليتك قبل التقديم.&nbsp;</p>
                    <h2>هل يمكن أن تتغير قائمة الدول المؤهلة لتأشيرة الهند الإلكترونية؟</h2>
                    <p>نعم. قد تتغير قائمة الدول المؤهلة لتأشيرة الهند الإلكترونية بسبب تحديثات في السياسات. يجب على المتقدمين التحقق من أحدث<a href="/ar/indian-visa-policy-map/"><strong>سياسة تأشيرة الهند</strong></a> للتأكد من أن دولتهم مؤهلة لتأشيرة e-Visa، أصبحت معفاة من التأشيرة أو تحتاج إلى التقديم على تأشيرة ملصقة تقليدية عبر سفارة.</p>
                    <h2>هل يمكنني دخول الهند عبر أي مطار أو ميناء بحري؟</h2>
                    <p>لا. يجب على المسافرين دخول الهند فقط عبر <a href="/ar/how-many-airports-and-seaport-are-there-in-india-for-evisa/"><strong>36 مطاراً محدداً و38 ميناءً بحرياً محدداً</strong></a>.</p>
                    <p><strong>ملاحظة:</strong></p>
                    <ul class="custom-style">
                        <li>يمكن للمتقدمين المغادرة من أي من نقاط تفتيش الهجرة المصرحة المذكورة أعلاه في الهند.</li>
                        <li>إذا وصلت إلى أي ميناء دخول آخر غير مذكور أعلاه، يُطلب من المتقدمين التقديم على تأشيرة هندية تقليدية في أقرب سفارة / قنصلية.</li>
                    </ul>
                    <p><strong>إخلاء المسؤولية:</strong> على الرغم من أن هذه المعلومات تم تحديثها آخر مرة في <?= $lastUpdated_ar ?>، نوصي بالتحقق مع الوكالات المناسبة والسفارات وشركات الطيران لضمان الدقة الكاملة فيما يتعلق بخطط سفرك.</p>
                </div>
            </div>
        </div>
        <?php include('includes/static_footer.php'); ?>
    </div>
</body>
</html>
<?php include('includes/footer_script.php'); ?>
<script src="<?= site_url() ?>/js/common.min.js" type="application/javascript"></script>
<script language="javascript">
    function check_req() {
        var select_value = document.getElementById("cbCountry").value;
        if (select_value != '' && select_value != ' ') {
            window.location.href = select_value;
        }
    }
    var isCountryListExpanded = false;
    function toggleCountryList() {
        var container = document.getElementById('countryListContainer');
        var btnSeeMore = document.getElementById('btnSeeMore');
        var btnSeeLess = document.getElementById('btnSeeLess');
        if (isCountryListExpanded) {
            container.classList.remove('expanded');
            container.classList.add('collapsed');
            btnSeeMore.style.display = 'inline-block';
            btnSeeLess.style.display = 'none';
        } else {
            container.classList.remove('collapsed');
            container.classList.add('expanded');
            btnSeeMore.style.display = 'none';
            btnSeeLess.style.display = 'inline-block';
        }
        isCountryListExpanded = !isCountryListExpanded;
    }
</script>`
  },
  {
    id: 'landing-page',
    name: 'SaaS Page with Schema & SEO',
    description: 'Includes Title, Meta Description, OpenGraph tags, and Schema.org JSON-LD',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudFlow - Next-Generation Cloud Management</title>
  <meta name="description" content="Deploy, scale, and monitor cloud apps with effortless automated workflows and real-time telemetry.">
  <meta name="keywords" content="cloud deployment, devops automation, infrastructure scaling">
  <meta property="og:title" content="CloudFlow - Next-Generation Cloud Management">
  <meta property="og:description" content="Deploy, scale, and monitor cloud apps with effortless automated workflows.">
  <meta property="og:site_name" content="CloudFlow Platform">

  <!-- Schema.org Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CloudFlow",
    "headline": "Next-Generation Automated Cloud Management Platform",
    "description": "Enterprise cloud infrastructure automation with zero-downtime rollouts and global edge acceleration.",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "category": "Free 14-Day Trial"
    }
  }
  </script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
  <header id="main-header" class="border-b border-gray-200 bg-white">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-xl font-bold text-indigo-600">CloudFlow</span>
      </div>
      <nav class="hidden md:flex space-x-8">
        <a href="#features" class="text-sm font-medium text-gray-600 hover:text-indigo-600">Features</a>
        <a href="#solutions" class="text-sm font-medium text-gray-600 hover:text-indigo-600">Solutions</a>
        <a href="#pricing" class="text-sm font-medium text-gray-600 hover:text-indigo-600">Pricing</a>
      </nav>
      <div class="flex items-center space-x-4">
        <button id="btn-login" class="text-sm font-semibold text-gray-700 hover:text-gray-900">Sign in</button>
        <button id="btn-get-started" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Get Started Free</button>
      </div>
    </div>
  </header>

  <main>
    <section class="py-20 text-center px-4">
      <div class="max-w-3xl mx-auto">
        <span class="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
          Version 3.0 Released
        </span>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Automate your cloud infrastructure in seconds
        </h1>
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">
          Deliver reliable software faster with automated rollouts, multi-region failover, and intelligent resource optimization powered by cutting-edge telemetry.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#trial" class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700">Start 14-Day Free Trial</a>
          <a href="#demo" class="px-6 py-3 rounded-lg bg-white text-gray-700 border border-gray-300 font-medium hover:bg-gray-50">Book a Demo</a>
        </div>
      </div>
    </section>

    <section id="features" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 rounded-xl border border-gray-100 bg-gray-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Zero-Downtime Deployments</h3>
          <p class="text-gray-600 text-sm">Deploy updates without disturbing active sessions or dropping requests.</p>
        </div>
        <div class="p-6 rounded-xl border border-gray-100 bg-gray-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Global Edge Acceleration</h3>
          <p class="text-gray-600 text-sm">Distribute dynamic responses across 300+ edge locations worldwide.</p>
        </div>
        <div class="p-6 rounded-xl border border-gray-100 bg-gray-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Enterprise Security</h3>
          <p class="text-gray-600 text-sm">Automated compliance monitoring, RBAC permissions, and end-to-end encryption.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
    <p>&copy; 2026 CloudFlow Inc. All rights reserved.</p>
  </footer>
</body>
</html>`
  },
  {
    id: 'product-card',
    name: 'E-Commerce with Product Schema',
    description: 'Product showcase with pricing, image alt tags, and Schema.org Product markup',
    html: `<div class="ecommerce-product-card max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-slate-200" id="product-card-892">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "AeroPro Wireless Noise-Cancelling Headphones",
    "description": "Studio-grade acoustics with active adaptive noise cancellation, up to 45 hours of battery life, and ultra-plush memory foam cushions.",
    "category": "Consumer Audio",
    "offers": {
      "@type": "Offer",
      "price": "299.00",
      "priceCurrency": "USD",
      "category": "In Stock"
    }
  }
  </script>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
    <div class="product-gallery">
      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop" 
           alt="Wireless Noise-Canceling Studio Headphones" 
           class="rounded-xl w-full object-cover shadow-sm" />
      <span class="inline-block mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
        In Stock - Ready to Ship
      </span>
    </div>
    <div class="product-details">
      <div class="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-1">Audio Master Series</div>
      <h2 class="text-2xl font-bold text-slate-900 mb-2">AeroPro Wireless Noise-Cancelling Headphones</h2>
      <p class="text-slate-600 text-sm mb-4 leading-relaxed">
        Immerse yourself in studio-grade acoustics with active adaptive noise cancellation, up to 45 hours of battery life, and ultra-plush memory foam cushions.
      </p>
      
      <div class="price-container flex items-baseline gap-3 mb-6">
        <span class="text-3xl font-extrabold text-slate-900">$299.00</span>
        <span class="text-base text-slate-400 line-through">$379.00</span>
        <span class="text-sm font-bold text-rose-600 save-badge">Save 21%</span>
      </div>

      <div class="purchase-actions flex gap-4">
        <button id="add-to-cart-btn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-150">
          Add to Shopping Cart
        </button>
        <button id="wishlist-btn" class="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600" title="Save to Wishlist">
          ♥
        </button>
      </div>

      <div class="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-1">
        <p>✓ Free worldwide shipping on orders over $50</p>
        <p>✓ 30-day money-back satisfaction guarantee</p>
        <p>✓ 2-year full manufacturer replacement warranty</p>
      </div>
    </div>
  </div>
</div>`
  }
];
